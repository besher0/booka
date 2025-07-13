/* eslint-disable prettier/prettier */
// src/product/product.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductType } from 'src/utils/enums';
import { Cafe } from '../cafe/cafe.entity'; // **استيراد كيان الكافيه**

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Cafe) 
    private cafeRepository: Repository<Cafe>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const cafe = await this.cafeRepository.findOne({ where: { id: createProductDto.cafeId } });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${createProductDto.cafeId} not found.`);
    }

    const newProduct = this.productRepository.create({
      ...createProductDto, 
      cafe: cafe, 
    });
    return this.productRepository.save(newProduct);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['cafe'] }); // جلب المنتجات مع معلومات الكافيه
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['cafe'] });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

async update(id: number, updateProductDto: UpdateProductDto, imageUrl?: string): Promise<Product> {
  const product = await this.findOne(id);
  Object.assign(product, updateProductDto);
  if (imageUrl) {
    product.imageUrl = imageUrl;
  }
  return this.productRepository.save(product);
}

  async remove(id: number){
    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
      return { message: 'Product has been deleted' }
  }

  // async addLike(id: number): Promise<Product> {
  //   const product = await this.findOne(id);
  //   product.likes = (product.likes || 0) + 1;
  //   return this.productRepository.save(product);
  // }

//   async removeLike(id: number){
//     const product = await this.findOne(id);
//     if(product.likes >0){
//     product.likes = (product.likes || 0) - 1;
//     return this.productRepository.save(product);
//   }
//   else return { message: 'like under 0' }
// }

  async findProductsByType(type: ProductType): Promise<Product[]> {
    return this.productRepository.find({ where: { type }, relations: ['cafe'] });
  }

  // **دالة جديدة: جلب المنتجات حسب الكافيه**
  async findProductsByCafe(cafeId: number): Promise<Product[]> {
    const cafe = await this.cafeRepository.findOne({ where: { id: cafeId } });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${cafeId} not found.`);
    }
    return this.productRepository.find({
      where: { cafe: { id: cafeId } },
      relations: ['cafe'],
      order: { createdAt: 'ASC' },
    });
  }
}
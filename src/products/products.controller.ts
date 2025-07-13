/* eslint-disable prettier/prettier */
// src/product/product.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductType } from 'src/utils/enums';
import { Product } from './product.entity';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { storage } from 'src/utils/cloudinary.storage';

@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

 @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    
  ): Promise<Product> {
    if (file && file.path) {
      createProductDto.imageUrl = file.path; // رابط الصورة من Cloudinary
    }
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

@Put(':id')
@UseInterceptors(FileInterceptor('image', { storage }))
async update(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @Body() updateProductDto: UpdateProductDto,
) {
  const imageUrl = file?.path;
  return this.productService.update(+id, updateProductDto, imageUrl);
}

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }

  // @Put(':id/like')
  // addLike(@Param('id') id: string) {
  //   return this.productService.addLike(+id);
  // }

  // @Put(':id/removelike')
  // removeLike(@Param('id') id: string) {
  //   return this.productService.removeLike(+id);
  // }

  @Get('type/:type')
  findProductsByType(@Param('type') type: ProductType) {
    return this.productService.findProductsByType(type);
  }

  @Get('cafe/:cafeId')
  findProductsByCafe(@Param('cafeId') cafeId: string) {
    return this.productService.findProductsByCafe(+cafeId);
  }
}
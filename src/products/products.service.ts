/* eslint-disable prettier/prettier */
// src/product/product.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductType } from '../utils/enum/enums';
import { Cafe } from '../cafe/cafe.entity';
import { ImageService } from '../uploads/image.service';
import { v2 as cloudinary } from 'cloudinary';
import { UsersService } from '../users/users.service';


@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Cafe)
    private cafeRepository: Repository<Cafe>,
    private readonly imageService: ImageService,
    private readonly usersService: UsersService,
  ) {}

  // دالة مساعدة لحذف صورة من Cloudinary
  private async deleteImageFromCloudinary(publicId: string): Promise<void> {
    try {
      if (!publicId) {
        console.warn('Public ID is missing for Cloudinary deletion. Skipping deletion.');
        return;
      }
      await cloudinary.uploader.destroy(publicId);
      console.log(`Image with public ID ${publicId} deleted from Cloudinary.`);
    } catch (error) {
      console.error(`Failed to delete image ${publicId} from Cloudinary:`, error);
      throw new BadRequestException(`Failed to delete image ${publicId} from Cloudinary.`);
    }
  }

  async create(createProductDto: CreateProductDto, imageFile?: Express.Multer.File, currentUserId?: number): Promise<Product> {
    const cafe = await this.cafeRepository.findOne({ where: { id: createProductDto.cafeId }, relations: ['owner'] });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${createProductDto.cafeId} not found.`);
    }

    // **التحقق من الصلاحيات: فقط مالك الكافيه يمكنه إنشاء منتج**
    // تم إزالة التحقق من كون المستخدم مسؤولاً
    if (cafe.owner?.id !== currentUserId) {
      throw new ForbiddenException('You are not authorized to create products for this cafe. Only the cafe owner can.');
    }

    const newProduct = this.productRepository.create({
      ...createProductDto,
      cafe: cafe,
    });

    if (imageFile) {
      if (!imageFile.filename || !imageFile.path) {
        throw new BadRequestException('Image file data (filename/path) is missing after upload.');
      }
      const imageRecord = await this.imageService.createImage(
        imageFile.filename,
        imageFile.path,
        imageFile.mimetype,
        imageFile.size,
      );
      newProduct.productImage = imageRecord;
      newProduct.imageId = imageRecord.id;
    }

   const savedProduct = await this.productRepository.save(newProduct);

    const productWithCafeIdOnly = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['cafe', 'productImage'],
      select: {
        id: true,
        name: true,
        price: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        cafe: {
          id: true,
          galleryImages:{
            id:true,
            filePath:true
          }
        },
        productImage: {
            id: true,
            filePath: true,
        }
      },
    });

    if (!productWithCafeIdOnly) {
      return savedProduct;
    }

    return productWithCafeIdOnly;
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['cafe', 'productImage'],
      select: {
        id: true,
        name: true,
        price: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        cafe: {
          id: true,
          galleryImages:{
            id:true,
            filePath:true
          }
        },
        productImage: {
            id: true,
            filePath: true,
        }
      },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['cafe', 'productImage', 'cafe.owner'],
      select: {
        id: true,
        name: true,
        price: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        cafe: {
          id: true,
          owner: { // تأكد من جلب معلومات المالك هنا
            id: true,
            // أضف أي حقول أخرى للمالك تحتاجها للتحقق من الصلاحيات
          },
        },
        productImage: {
            id: true,
            filePath: true,
        }
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto, imageFile?: Express.Multer.File | null, currentUserId?: number): Promise<Product> {
    const product = await this.findOne(id);

    // **التحقق من الصلاحيات: فقط مالك الكافيه يمكنه تحديث المنتج**
    // تم إزالة التحقق من كون المستخدم مسؤولاً
    if (product.cafe.owner?.id !== currentUserId) {
      throw new ForbiddenException('You are not authorized to update this product. Only the cafe owner can.');
    }

    // تحديث الخصائص الأخرى
    Object.assign(product, updateProductDto);

    if (imageFile !== undefined) {
      if (imageFile === null) {
        if (product.productImage) {
          await this.deleteImageFromCloudinary(product.productImage.filename);
          await this.imageService.deleteImageRecord(product.productImage.id);
        }
        product.productImage = null;
        product.imageId = null;
      } else {
        if (product.productImage) {
          await this.deleteImageFromCloudinary(product.productImage.filename);
          await this.imageService.deleteImageRecord(product.productImage.id);
        }
        if (!imageFile.filename || !imageFile.path) {
          throw new BadRequestException('New image file data (filename/path) is missing after upload.');
        }
        const newImageRecord = await this.imageService.createImage(
          imageFile.filename,
          imageFile.path,
          imageFile.mimetype,
          imageFile.size,
        );
        product.productImage = newImageRecord;
        product.imageId = newImageRecord.id;
      }
    }

   const savedProduct=await this.productRepository.save(product);

    const productWithCafeIdOnly = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['cafe', 'productImage'],
      select: {
        id: true,
        name: true,
        price: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        cafe: {
          id: true,
          galleryImages:{
            id:true,
            filePath:true
          }
        },
        productImage: {
            id: true,
            filePath: true,
        }
      },
    });

    if (!productWithCafeIdOnly) {
      return savedProduct;
    }

    return productWithCafeIdOnly;
  }

  async remove(id: number, currentUserId: number): Promise<{ message: string }> {
    const product = await this.findOne(id);

    // **التحقق من الصلاحيات: فقط مالك الكافيه يمكنه حذف المنتج**
    // تم إزالة التحقق من كون المستخدم مسؤولاً
    if (product.cafe.owner?.id !== currentUserId) {
      throw new ForbiddenException('You are not authorized to delete this product. Only the cafe owner can.');
    }

    if (product.productImage) {
      await this.deleteImageFromCloudinary(product.productImage.filename);
      await this.imageService.deleteImageRecord(product.productImage.id);
    }

    const result = await this.productRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return { message: 'Product has been deleted' }
  }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findProductsByType(type: ProductType): Promise<Product[]> {
    return this.productRepository.find({ relations: ['cafe', 'productImage'],select: {
        id: true,
        name: true,
        price: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        cafe: {
          id: true,
        },
        productImage: {
            id: true,
            filePath: true,
        }
      },
    });
}

  async findProductsByCafe(cafeId: number): Promise<Product[]> {
    const cafe = await this.cafeRepository.findOne({ where: { id: cafeId }, relations: ['owner'] });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${cafeId} not found.`);
    }
    return this.productRepository.find({
      where: { cafe: { id: cafeId } },
      relations: ['cafe', 'productImage'],
      order: { createdAt: 'ASC' },select: {
        id: true,
        name: true,
        price: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        cafe: {
          id: true,
        },
        productImage: {
            id: true,
            filePath: true,
        }
      },
    });
  }
}
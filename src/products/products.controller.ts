/* eslint-disable prettier/prettier */
// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductType, UserType } from 'src/utils/enum/enums';
import { Product } from './product.entity';
import { uploadsStorage } from 'src/utils/cloudinary.storageUploads';

import { CreateProductSwaggerDto } from './dto/create-product-swagger.dto';
import { UpdateProductSwaggerDto } from './dto/update-product-swagger.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard';
import { Roles } from '../users/decorators/user-role.decorator';


@ApiTags('Products')
@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserType.CAFE_OWNER) // **فقط مالكو المقاهي يمكنهم إنشاء المنتجات**
  @UseInterceptors(FileInterceptor('imageFile', { storage: uploadsStorage }))
  @ApiOperation({ summary: 'Create a new product (Cafe Owner only)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Product data with optional image upload',
    type: CreateProductSwaggerDto,
  })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: Product })
  @ApiResponse({ status: 400, description: 'Image file data is missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden: User is not cafe owner.' }) // تم تحديث الوصف
  @ApiResponse({ status: 404, description: 'Cafe not found.' })
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    let imageFile: Express.Multer.File | undefined | null;

    if (file) {
      if (!file.filename || !file.path) {
        throw new BadRequestException('Image file data (filename/path) is missing after upload.');
      }
      imageFile = file;
    } else {
      imageFile = undefined;
    }

    return this.productService.create(createProductDto, imageFile, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products', type: [Product] })
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Product found', type: Product })
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Put(':id')
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserType.CAFE_OWNER) // **فقط مالكو المقاهي يمكنهم تحديث المنتجات**
  @UseInterceptors(FileInterceptor('imageFile', { storage: uploadsStorage }))
  @ApiOperation({ summary: 'Update product by ID (Cafe Owner only)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ description: 'Product update data with optional new image', type: UpdateProductSwaggerDto })
  @ApiResponse({ status: 200, description: 'Product updated successfully', type: Product })
  @ApiResponse({ status: 400, description: 'Image file data is missing or invalid' })
  @ApiResponse({ status: 403, description: 'Forbidden: User is not cafe owner.' }) // تم تحديث الوصف
  @ApiResponse({ status: 404, description: 'Product or Cafe not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: User,
    @UploadedFile() file?: Express.Multer.File | null,
  ): Promise<Product> {
    let imageFile: Express.Multer.File | undefined | null;

    if (file !== undefined) {
      if (file === null) {
        imageFile = null;
      } else {
        if (!file.filename || !file.path) {
          throw new BadRequestException('New image file data (filename/path) is missing after upload.');
        }
        imageFile = file;
      }
    } else {
      imageFile = undefined;
    }

    return this.productService.update(+id, updateProductDto, imageFile, user.id);
  }

  @Delete(':id')
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserType.CAFE_OWNER) // **فقط مالكو المقاهي يمكنهم حذف المنتجات**
  @ApiOperation({ summary: 'Delete product by ID (Cafe Owner only)' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: User is not cafe owner.' }) // تم تحديث الوصف
  @ApiResponse({ status: 404, description: 'Product or Cafe not found.' })
  remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    return this.productService.remove(+id, user.id);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get products by type' })
  @ApiParam({ name: 'type', enum: ProductType })
  @ApiResponse({ status: 200, description: 'List of products by type', type: [Product] })
  findProductsByType(@Param('type') type: ProductType) {
    return this.productService.findProductsByType(type);
  }

  @Get('cafe/:cafeId')
  @ApiOperation({ summary: 'Get products by cafe ID' })
  @ApiParam({ name: 'cafeId', type: Number })
  @ApiResponse({ status: 200, description: 'List of products by cafe', type: [Product] })
  findProductsByCafe(@Param('cafeId') cafeId: string) {
    return this.productService.findProductsByCafe(+cafeId);
  }
}
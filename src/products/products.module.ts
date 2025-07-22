/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './products.service';
import { ProductController } from './products.controller';
import { Product } from './product.entity';
import { Cafe } from '../cafe/cafe.entity';
import { ImageModule } from '../uploads/image.module'; // <--- استيراد ImageModule
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Cafe]),
    ImageModule, // <--- إضافة ImageModule
UsersModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
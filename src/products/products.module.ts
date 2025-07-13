/* eslint-disable prettier/prettier */
// src/product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './products.service';
import { ProductController } from './products.controller';
import { Product } from './product.entity';
import { Cafe } from '../cafe/cafe.entity'; // **استيراد كيان الكافيه**

@Module({
  imports: [TypeOrmModule.forFeature([Product, Cafe])], // **تسجيل Product و Cafe هنا**
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
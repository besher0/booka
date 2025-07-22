/* eslint-disable prettier/prettier */
// src/image/image.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image.entity';
import { ImageService } from './image.service';

@Module({
  imports: [TypeOrmModule.forFeature([Image])], // تسجيل كيان Image مع TypeORM
  providers: [ImageService], // توفير ImageService
  exports: [ImageService], // جعل ImageService متاحًا للوحدات الأخرى للاستيراد (مثل UploadsModule)
})
export class ImageModule {}
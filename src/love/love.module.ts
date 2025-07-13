/* eslint-disable prettier/prettier */
// src/love/love.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoveService } from './love.service';
import { LoveController } from './love.controller';
import { Love } from './love.entity';
import { User } from '../users/user.entity';
import { Cafe } from '../cafe/cafe.entity';
import { Product } from '../products/product.entity'; // استيراد كيان المنتج
import { Comment } from '../comments/comment.entity'; // استيراد كيان التعليق
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Love, User, Cafe, Product, Comment]), // **تسجيل جميع الكيانات هنا**
    UsersModule,
  ],
  controllers: [LoveController],
  providers: [LoveService],
  exports: [LoveService],
})
export class LoveModule {}
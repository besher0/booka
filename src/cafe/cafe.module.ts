/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
// src/cafe/cafe.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CafesController } from './cafe.controller';
import { CafeService } from './cafe.service';
import { Cafe } from './cafe.entity';
// import { CafeImage } from './gallary.entity'; // <--- حذف هذا الاستيراد
import { ImageModule } from '../uploads/image.module'; // <--- تصحيح مسار ImageModule
import { UsersModule } from 'src/users/users.module';
import { AdminCodeModule } from 'src/code/code.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Cafe]), 
    ImageModule, 
    UsersModule,
    AdminCodeModule
  ],
  controllers: [CafesController],
  providers: [CafeService],
  exports: [CafeService],
})
export class CafesModule {}
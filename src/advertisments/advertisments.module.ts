/* eslint-disable prettier/prettier */
// src/advertisement/advertisement.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdvertisementService } from './advertisments.service';
import { AdvertisementController } from './advertisments.controller';
import { Advertisement } from './advertisments.entity';
import { ImageModule } from '../uploads/image.module'; // لاستخدام ImageService
import { UsersModule } from '../users/users.module'; // لاستخدام UsersService و Guards

@Module({
  imports: [
    TypeOrmModule.forFeature([Advertisement]), 
    ImageModule, 
    UsersModule, 
  ],
  providers: [AdvertisementService],
  controllers: [AdvertisementController],
  exports: [AdvertisementService], 
})
export class AdvertisementModule {}
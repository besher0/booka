/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cafe } from './cafe.entity';
import { CafeService } from './cafe.service';
import { CafesController } from './cafe.controller';
import { CafeImage } from './gallary.entity';

@Module({
    controllers:[CafesController],
    providers:[CafeService],
   imports:[TypeOrmModule.forFeature([Cafe,CafeImage])]
})
export class CafesModule {}

/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CafesModule } from './cafe/cafe.module';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cafe } from './cafe/cafe.entity';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/comment.entity';
import { ProductModule } from './products/products.module';
import { Product } from './products/product.entity';
import {Love}from './love/love.entity'
import { LoveModule } from './love/love.module';
import { FirebaseModule } from './firebase/firebase.module';
import { Device } from './device/device.entity';
import { DeviceModule } from './device/device.module';
import { NotificationModule } from './notification/notification.module';
import { CafeImage } from './cafe/gallary.entity';
import { TableBookingModule } from './table-booking/table-booking.module';
import { TableBooking } from './table-booking/table-booking.entity';

@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal:true,
      envFilePath: `.env.${process.env.NODE_ENV}`
    }),
    CafesModule,UsersModule,CommentsModule,ProductModule,LoveModule,FirebaseModule,DeviceModule,NotificationModule,TableBookingModule,
     TypeOrmModule.forRootAsync({
          inject:[ConfigService],
          useFactory:(config:ConfigService)=>{
            return{
            type:'postgres',
            database:config.get<string>("DB_DATABASE"),
            username:config.get<string>("DB_USERNAME"),
            password:config.get<string>("DB_PASSWORD"),
            port:config.get<number >("DB_PORT"),
            host:'localhost',
            synchronize:true,
            entities:[Cafe,User,Comment,Product,Love,Device,CafeImage,TableBooking]
            }
          }
    }),
     TableBookingModule,

   
  ],
  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

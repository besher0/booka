/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
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
import { TableBookingModule } from './table-booking/table-booking.module';
import { TableBooking } from './table-booking/table-booking.entity';
import { RatingModule } from './rating/rating.module';
import { Rating } from './rating/rating.entity';
import { ShoppingCartModule } from './cart/cart.module';
import { ShoppingCart } from './cart/cart.entity';
import { OrderModule } from './order/order.module';
import { Order } from './order/order.entity';
import { CartItem } from './cart/cart-item.entity';
import { OrderItem } from './order/order-item.entity';
import { UploadsModule } from './uploads/uploads.module';
import { Image } from '../src/uploads/image.entity'; // <--- !!! هذا هو السطر الذي يجب إضافته !!!
import { AdminCodeModule } from './code/code.module';
import { AdminCode } from './code/code.entity';
import { AdvertisementModule } from './advertisments/advertisments.module';
import { Advertisement } from './advertisments/advertisments.entity';


@Module({
  imports: [
     ConfigModule.forRoot({
      isGlobal:true,
      envFilePath: `.env.${process.env.NODE_ENV}`
    }),
    CafesModule,UsersModule,CommentsModule,ProductModule,LoveModule,FirebaseModule,DeviceModule,NotificationModule,TableBookingModule,AdminCodeModule,UploadsModule,RatingModule,ShoppingCartModule,
     TypeOrmModule.forRootAsync({
          inject:[ConfigService],
          useFactory:(config:ConfigService)=>{
            return{
            type:'postgres', // ملاحظة: لقد ذكرت MySQL سابقًا، لكن الإعدادات هنا تظهر PostgreSQL. تأكد أن هذا يطابق نوع قاعدة بياناتك الفعلي.
            database:config.get<string>("DB_DATABASE"),
            username:config.get<string>("DB_USERNAME"),
            password:config.get<string>("DB_PASSWORD"),
            port:config.get<number >("DB_PORT"),
            host:'localhost',
            synchronize:true,
            entities:[Cafe,User,Comment,Product,Love,Device,TableBooking,Rating,ShoppingCart,Order,CartItem,OrderItem,Image,AdminCode,Advertisement] // `Image` هنا سيتم التعرف عليه بعد الاستيراد
            }
          }
    }),
     TableBookingModule,
     RatingModule,
     OrderModule,
    AdvertisementModule,

   
  ],
  
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}
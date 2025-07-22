/* eslint-disable prettier/prettier */
// src/order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// ... (استيرادات OrderService, OrderController, Order, OrderItem, User, Cafe)
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { User } from '../users/user.entity';
import { Cafe } from '../cafe/cafe.entity';
import { UsersModule } from '../users/users.module'; // لتوفر AuthGuard و CurrentUser
import { ShoppingCartModule } from '../cart/cart.module'; // **استيراد جديد**
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, Cafe]),
    UsersModule,
    ShoppingCartModule, // **إضافة ShoppingCartModule**
    NotificationModule
  ],
  controllers: [OrderController],
  providers: [OrderService,],
  exports: [OrderService],
})
export class OrderModule {}
/* eslint-disable prettier/prettier */
// src/shopping-cart/shopping-cart.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingCartService } from './cart.service';
import { ShoppingCartController } from './cart.controller';
import { ShoppingCart } from './cart.entity';
import { CartItem } from './cart-item.entity';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';
import { UsersModule } from '../users/users.module'; // لتوفر AuthGuard و CurrentUser

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingCart, CartItem, User, Product]), // تسجيل كيانات السلة والمنتج والمستخدم
    UsersModule, // لاستخدام AuthGuard و CurrentUser
  ],
  controllers: [ShoppingCartController],
  providers: [ShoppingCartService,],
  exports: [ShoppingCartService], // إذا أردت استخدامها في OrderService
})
export class ShoppingCartModule {}
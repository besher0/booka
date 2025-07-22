/* eslint-disable prettier/prettier */
// src/cart/entities/cart.entity.ts
// src/shopping-cart/shopping-cart.entity.ts
import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity'; // تأكد من المسار
import { CartItem } from './cart-item.entity'; // تأكد من المسار

@Entity('shopping_carts')
export class ShoppingCart {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.shoppingCart, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // يحدد عمود المفتاح الأجنبي في جدول shopping_carts
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.shoppingCart, { cascade: true, eager: true })
  cartItems: CartItem[]; // عناصر السلة

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
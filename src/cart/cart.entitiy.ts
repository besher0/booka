/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
// src/shopping-cart/cart-item.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { ShoppingCart } from './cart.entity'; // تأكد من المسار
import { Product } from '../products/product.entity'; // تأكد من المسار

@Entity('cart_items')
// حافظ على هذا القيد الفريد، لكن الآن ستكون الأعمدة موجودة صراحةً
@Unique(['shoppingCartId', 'productId'])
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  quantity: number;

  @Column({ type: 'float', nullable: false })
  priceAtAddition: number; // سعر المنتج وقت إضافته للسلة

  // أضف عمود المفتاح الخارجي صراحةً لـ shoppingCart
  @Column({ type: 'int' }) // نوع البيانات يجب أن يتوافق مع نوع معرف ShoppingCart (عادة int)
  shoppingCartId: number; // هذا هو العمود الذي يتوقعه القيد الفريد

  // أضف عمود المفتاح الخارجي صراحةً لـ product
  @Column({ type: 'int' }) // نوع البيانات يجب أن يتوافق مع نوع معرف Product (عادة int)
  productId: number; // هذا هو العمود الذي يتوقعه القيد الفريد

  @ManyToOne(() => ShoppingCart, (shoppingCart) => shoppingCart.cartItems, { 
    onDelete: 'CASCADE',

  })
  shoppingCart: ShoppingCart;

  @ManyToOne(() => Product, (product) => product.cartItems, { onDelete: 'CASCADE',})
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
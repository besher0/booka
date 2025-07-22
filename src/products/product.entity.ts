/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm'; // أضف JoinColumn
import { ProductType } from '../utils/enum/enums';
import { Cafe } from '../cafe/cafe.entity';
import { Love } from '../love/love.entity';
import { CartItem } from '../cart/cart-item.entity';
import { OrderItem } from '../order/order-item.entity';
import { Image } from '../uploads/image.entity'; // <--- استيراد كيان Image


@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string;

  // @Column({ type: 'varchar', length: 500, nullable: true }) // <--- حذف هذا الحقل
  // imageUrl?: string; // <--- حذف هذا الحقل

  // علاقة الصورة: ManyToOne مع Image entity
  @ManyToOne(() => Image, image => image.products, { nullable: true, onDelete: 'SET NULL' }) // onDelete: 'SET NULL' إذا حذفت الصورة الأصلية
  @JoinColumn({ name: 'imageId' }) // المفتاح الأجنبي في جدول 'products'
  productImage: Image | null; // <--- هذا هو كيان الصورة للمنتج

  @Column({ nullable: true })
  imageId: number | null; // <--- المفتاح الأجنبي لـ productImage


  @Column({ type: 'float', nullable: false })
  price: number;

  @Column({ type: 'enum', enum: ProductType, nullable: false })
  type: ProductType;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Cafe, (cafe) => cafe.products)
  cafe: Cafe;

  @OneToMany(() => Love, (love) => love.product)
  loves: Love[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}
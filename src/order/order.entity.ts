/* eslint-disable prettier/prettier */
// src/order/order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Cafe } from '../cafe/cafe.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../utils/enum/order-status.enum'; // تأكد من المسار
import { DeliveryMethod } from '../utils/enum/delivery-method.enum'; // تأكد من المسار

// **تأكيد PaymentMethod هنا أيضاً إذا لم يكن في ملف enum خاص به**
export enum PaymentMethod {
  CASH = 'cash',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: false })
  totalAmount: number;

  @Column({ type: 'float', default: 0 })
  discountAmount: number;

  @Column({ type: 'float', default: 0 })
  taxAmount: number;

  @Column({ type: 'float', nullable: false })
  finalAmount: number;//يقضل ينشال

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'enum', enum: DeliveryMethod, nullable: false }) // تأكد من أنه يستخدم DeliveryMethod الجديد
  deliveryMethod: DeliveryMethod;

  @Column({ type: 'int', nullable: true })
  numberOfPeople?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: false }) // تأكد من أنه يستخدم PaymentMethod
  paymentMethod: PaymentMethod;

  @Column({ type: 'jsonb', nullable: true })
  paymentDetails?: any;//لازم ينشال

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => Cafe, (cafe) => cafe.orders, { onDelete: 'SET NULL' })
  cafe: Cafe;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
/* eslint-disable prettier/prettier */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,OneToMany,  } from 'typeorm';
import { ProductType } from '../utils/enums';
import { Cafe } from '../cafe/cafe.entity'; // **استيراد كيان الكافيه**
import { Love } from '../love/love.entity'; 


@Entity('products') // اسم الجدول في قاعدة البيانات
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string; // اسم المنتج (إلزامي)

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl?: string; // رابط الصورة (اختياري)

  @Column({ type: 'float', nullable: false })
  price: number; // السعر (إلزامي، يمكن أن يكون عشرياً)

  @Column({ type: 'enum', enum: ProductType, nullable: false })
  type: ProductType; // نوع المنتج (مشروبات أو مأكولات، إلزامي)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; // تاريخ الإنشاء

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date; // تاريخ آخر تحديث

  @ManyToOne(() => Cafe, (cafe) => cafe.products)
  cafe: Cafe; // هذا هو الحقل الذي سيحتوي على كائن الكافيه المرتبط

 @OneToMany(() =>  Love, (love) => love.product)
  loves: Love[]; // هنا يبقى النوع Love[]
  
}
/* eslint-disable prettier/prettier */
// src/advertisement/advertisement.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Image } from '../uploads/image.entity'; // تأكد من المسار الصحيح لـ Image
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'advertisements' })
export class Advertisement {
  @ApiProperty({ description: 'المعرف الفريد للإعلان', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'عنوان الإعلان', example: 'خصم كبير على جميع المنتجات!' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @ApiProperty({ description: 'الرابط الذي يوجه إليه الإعلان عند النقر', example: 'https://yourwebsite.com/sale' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  linkUrl?: string;

  @ApiProperty({ description: 'هل الإعلان نشط حالياً؟', example: true })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'تاريخ بداية عرض الإعلان', example: '2025-07-01T00:00:00.000Z' })
  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date|null;

  @ApiProperty({ description: 'تاريخ انتهاء عرض الإعلان', example: '2025-07-31T23:59:59.000Z' })
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date|null;

  // علاقة الصورة: ManyToOne مع Image entity
  @ManyToOne(() => Image, image => image.advertisements, { nullable: true, onDelete: 'CASCADE' }) // يجب أن يكون الإعلان لديه صورة
  @JoinColumn({ name: 'imageId' }) // المفتاح الأجنبي في جدول 'advertisements'
  image: Image|null;

  @Column({ nullable: true })
  imageId: number|null; // المفتاح الأجنبي لـ image

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
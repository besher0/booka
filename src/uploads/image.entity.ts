/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
// src/image/image.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Cafe } from '../cafe/cafe.entity';
import { Product } from '../products/product.entity'; // <--- استيراد كيان المنتج
import { Advertisement } from 'src/advertisments/advertisments.entity';


@Entity({ name: 'images' })
export class Image {
  @ApiProperty({ description: 'المعرف الفريد لسجل الصورة في قاعدة البيانات', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'اسم الملف الفريد الذي تم إنشاؤه وتخزينه على الخادم (public_id من Cloudinary)', example: 'my-photo-1701234567890-123456789.jpg' })
  @Column({ unique: true, nullable: false })
  filename: string;

  @ApiProperty({ description: 'الرابط الكامل للصورة على Cloudinary', example: 'https://res.cloudinary.com/your_cloud/image_public_id.jpg' })
  @Column({ nullable: false })
  filePath: string;

  @ApiProperty({ description: 'نوع MIME للملف', example: 'image/jpeg' })
  @Column({ nullable: false })
  mimetype: string;

  @ApiProperty({ description: 'حجم الملف بالبايت', example: 102400 })
  @Column('bigint', { nullable: false })
  size: number;

  @ApiProperty({ description: 'وقت رفع الصورة' })
  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToMany(() => Cafe, cafe => cafe.galleryImages)
  cafesInGallery: Cafe[];

  @OneToMany(() => Cafe, cafe => cafe.mainImage)
  cafesAsMain: Cafe[];

  @OneToMany(() => Product, product => product.productImage) // <--- علاقة عكسية لصور المنتجات
  products: Product[]; // هنا ستكون مصفوفة من المنتجات التي تستخدم هذه الصورة

  @OneToMany(() => Advertisement, advertisement => advertisement.image) // <--- علاقة عكسية لصور الإعلانات
  advertisements: Advertisement[];
}
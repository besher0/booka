/* eslint-disable prettier/prettier */
// src/love/love.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Cafe } from '../cafe/cafe.entity';
import { Product } from '../products/product.entity'; // استيراد كيان المنتج
import { Comment } from '../comments/comment.entity'; // استيراد كيان التعليق

@Entity('loves')
export class Love {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.loves, { onDelete: 'CASCADE' })
  user: User;

  // علاقة اختيارية مع الكافيه
  @ManyToOne(() => Cafe, (cafe) => cafe.loves, { nullable: true, onDelete: 'CASCADE' })
  cafe: Cafe;

  // علاقة اختيارية مع المنتج
  @ManyToOne(() => Product, (product) => product.loves, { nullable: true, onDelete: 'CASCADE' })
  product: Product;

  // علاقة اختيارية مع التعليق
  @ManyToOne(() => Comment, (comment) => comment.loves, { nullable: true, onDelete: 'CASCADE' })
  comment: Comment;

  @CreateDateColumn()
  createdAt: Date;
}
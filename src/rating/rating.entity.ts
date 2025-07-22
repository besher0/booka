/* eslint-disable prettier/prettier */
// src/rating/rating.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity'; // تأكد من المسار
import { Cafe } from '../cafe/cafe.entity';   // تأكد من المسار

@Entity('ratings')
@Unique(['user', 'cafe']) // يضمن أن المستخدم لا يمكنه تقييم نفس الكافيه أكثر من مرة
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  // قيمة التقييم من 1 إلى 5 نجوم
  value: number; // مثلاً 1, 2, 3, 4, 5

  // العلاقات:
  @ManyToOne(() => User, (user) => user.ratings, { onDelete: 'CASCADE' })
  user: User; // المستخدم الذي قام بالتقييم

  @ManyToOne(() => Cafe, (cafe) => cafe.ratings, { onDelete: 'CASCADE' })
  cafe: Cafe; // الكافيه الذي تم تقييمه

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
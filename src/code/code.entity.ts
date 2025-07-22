/* eslint-disable prettier/prettier */
// src/admin-code/admin-code.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'; // تم إزالة ManyToOne, JoinColumn لأنها لم تعد تستخدم
// import { User } from '../users/user.entity'; // لم يعد ضرورياً إذا لم تكن هناك علاقات ManyToOne من هنا
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'admin_codes' })
export class AdminCode {
  @ApiProperty({ description: 'المعرف الفريد للكود', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'الكود الفريد الذي تم توليده', example: 'ABCDEF12' })
  @Column({ unique: true, length: 20 })
  code: string;

  @ApiProperty({ description: 'هل تم استخدام هذا الكود من قبل؟', example: false })
  @Column({ default: false })
  isUsed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
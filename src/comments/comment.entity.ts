/* eslint-disable prettier/prettier */
/*eslint-disable no-irregular-whitespace */
// src/comment/comment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne ,OneToMany} from 'typeorm';
import { User } from '../users/user.entity'; 
import { Cafe } from '../cafe/cafe.entity';   
import { Love } from '../love/love.entity'; 


@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; 
//اضافة وقت التعديل
  @ManyToOne(() => User, (user) => user.comments ,{ eager: false, cascade: false })
  user: User; // هذا هو حقل كائن المستخدم الكاتب

  @ManyToOne(() => Cafe, (cafe) => cafe.comments,{ eager: false, cascade: false })
  cafe: Cafe; 

@OneToMany(() => Love, (love) => love.comment)
  loves: Love[];
}
/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cafe } from 'src/cafe/cafe.entity';

@Entity()
export class CafeImage  {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Cafe, (cafe) => cafe.galleryImages, { onDelete: 'CASCADE' })
  cafe: Cafe;
}

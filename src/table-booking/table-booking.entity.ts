/* eslint-disable prettier/prettier */
// src/table-booking/table-booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity'; // تأكد من المسار
import { Cafe } from '../cafe/cafe.entity';   // تأكد من المسار
import { SessionType } from '../utils/enum/session-type.enum'; // تأكد من المسار
import { BookingStatus } from '../utils/enum/booking-status.enum'; // تأكد من المسار

@Entity('table_bookings')
export class TableBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column({ type: 'time', nullable: false })
  time: string;

  @Column({ type: 'int', nullable: false })
  numberOfPeople: number;

  @Column({ type: 'enum', enum: SessionType, nullable: false })
  sessionType: SessionType;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING, nullable: false })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @ManyToOne(() => User, (user) => user.tableBookings, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Cafe, (cafe) => cafe.tableBookings, { onDelete: 'CASCADE' })
  cafe: Cafe;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
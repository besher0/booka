/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { UserType } from "../utils/enum/enums"; // تأكد من أن هذا المسار صحيح
import { Exclude } from "class-transformer";
import { Comment } from '../comments/comment.entity';
import { Love } from '../love/love.entity'
import { Device } from '../device/device.entity';
import { TableBooking } from "src/table-booking/table-booking.entity";

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: '150', nullable: true })
    username: string;

    @Column({ type: 'varchar', unique: true })
    phoneNumber: string;

    // @Column({ type: 'varchar', length: '250', unique: true, nullable: true })
    // email: string;
@Column({ type: 'enum', enum: ['ذكر', 'أنثى']  })
  gender: string;

    @Column({ nullable: true })
    @Exclude()
    password: string;

    @Column({ type: 'enum', enum: UserType, default: UserType.NORMAL_USER })
    userType: UserType;

    // @Column({ default: false })
    // isAccountVerified: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(()=>Comment,(comment)=>comment.user ,{ eager: true })
    comments:Comment[];

   @OneToMany(() => Love, (love) => love.user)
  loves: Love[];

  @OneToMany(() => Device, (device) => device.user)
  devices: Device[]; 

  @OneToMany(() => TableBooking, (booking) => booking.user)
  tableBookings: TableBooking[];
}
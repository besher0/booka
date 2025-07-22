/* eslint-disable prettier/prettier */
// src/users/user.entity.ts
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, } from "typeorm";
import { Gender, UserType } from "../utils/enum/enums";
import { Exclude } from "class-transformer";
import { Comment } from '../comments/comment.entity';
import { Love } from '../love/love.entity'
import { Device } from '../device/device.entity';
import { TableBooking } from "../table-booking/table-booking.entity";
import { Rating } from "../rating/rating.entity";
import { ShoppingCart } from "../cart/cart.entity";
import { Order } from "../order/order.entity";
import { Cafe } from "../cafe/cafe.entity";


@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: '150', nullable: true })
    username: string;

    @Column({ type: 'varchar', unique: true })
    phoneNumber: number;

    @Column({ type: 'enum', enum: Gender })
    gender: string;

    @Column({ nullable: true })
    @Exclude()
    password: string;

    @Column({ type: 'enum', enum: UserType, default: UserType.NORMAL_USER })
    userType: UserType;

    @OneToMany(() => Rating, (rating) => rating.user)
    ratings: Rating[];

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

    @OneToOne(() => ShoppingCart, (shoppingCart) => shoppingCart.user)
    shoppingCart: ShoppingCart;

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @OneToMany(() => Cafe, (cafe) => cafe.owner)
    ownedCafes: Cafe[];

    // تم حذف العلاقات العكسية التي كانت تشير إلى الأعمدة التي تم إلغاؤها من AdminCode:
    // @OneToMany(() => AdminCode, adminCode => adminCode.generatedByUser)
    // generatedAdminCodes: AdminCode[];

    // @OneToMany(() => AdminCode, adminCode => adminCode.assignedToUser)
    // assignedAdminCodes: AdminCode[];
}
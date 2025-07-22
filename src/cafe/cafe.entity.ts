/* eslint-disable prettier/prettier */
// src/cafe/cafe.entity.ts
import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    OneToMany,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
} from 'typeorm'
import { Comment } from '../comments/comment.entity';
import { CURRENT_TIMESTAMP } from '../utils/constants'
import { Product } from '../products/product.entity';
import { Love } from '../love/love.entity';
import { TableBooking } from '../table-booking/table-booking.entity';
import { Rating } from '../rating/rating.entity';
import { Order } from '../order/order.entity';
import { User } from '../users/user.entity';
import { Image } from '../uploads/image.entity';
import { CafeStatus } from '../utils/enum/enums'; // <--- استيراد CafeStatus


@Entity({ name: 'cafe' })
export class Cafe {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'varchar', length: '150' })
    name: string

    @Column({ type: 'enum', enum: ['sport', 'public', 'study', 'tourist'], nullable: true })
    type: string;

    @Column()
    description: string

    @Column({ nullable: true })
    location: string

    @OneToMany(() => Rating, (rating) => rating.cafe)
    ratings: Rating[];

    @ManyToOne(() => Image, image => image.cafesAsMain, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'mainImageId' })
    mainImage: Image | null;

    @Column({ nullable: true })
    mainImageId: number | null;

    @ManyToMany(() => Image, image => image.cafesInGallery, { cascade: true, eager: true })
    @JoinTable({
        name: 'cafe_gallery_images',
        joinColumn: { name: 'cafeId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'imageId', referencedColumnName: 'id' },
    })
    galleryImages: Image[];

    @Column({ type: 'enum', enum: CafeStatus, default: CafeStatus.PENDING }) // <--- إضافة خاصية status هنا
    status: CafeStatus;

    @Column()
    openingTime: string;
    @Column()
    closingTime: string

    @CreateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP })
    createdAt: Date
    @UpdateDateColumn({ type: 'timestamp', default: () => CURRENT_TIMESTAMP, onUpdate: CURRENT_TIMESTAMP })
    updateAt: Date

    @OneToMany(() => Comment, (comment) => comment.cafe, { eager: true })
    comments: Comment[];

    @OneToMany(() => Product, (product) => product.cafe)
    products: Product[];

    @ManyToOne(() => User, (user) => user.ownedCafes, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'ownerId' })
    owner: User | null;

    @Column({ nullable: true })
    ownerId: number | null;

    @OneToMany(() => Love, (love) => love.cafe)
    loves: Love[];

    @OneToMany(() => TableBooking, (booking) => booking.cafe)
    tableBookings: TableBooking[];

    @Column({ type: 'float', nullable: true, default: 0.0 })
    averageRating: number;

    @Column({ type: 'int', nullable: false, default: 0 })
    totalRatingsCount: number;

    @OneToMany(() => Order, (order) => order.cafe)
    orders: Order[];
    rejectionReason: string | null | undefined;
}
/* eslint-disable prettier/prettier */
import {
    Entity,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    PrimaryGeneratedColumn,
    OneToMany,

} from 'typeorm'
import { Comment } from '../comments/comment.entity';
import {CURRENT_TIMESTAMP} from 'src/utils/constants'
import { Product } from 'src/products/product.entity';
import { Love } from 'src/love/love.entity';
import { CafeImage } from './gallary.entity';
import { TableBooking } from 'src/table-booking/table-booking.entity';

@Entity({name:'cafe'})
export class Cafe{
    @PrimaryGeneratedColumn()
    id:number

    @Column({type:'varchar',length:'150'})
    name:string

    @Column({ type: 'enum', enum: ['sport', 'public','study','tourist'] , nullable: true })
    type: string;

    @Column()
    description:string

    @Column({ nullable: true} )
    location:string

    @Column({type:'float',nullable: true })
    rating:number

    @Column({ nullable: true })
  mainImageUrl: string; // الصورة الرئيسية للكافيه

  @OneToMany(() => CafeImage , (image) => image.cafe, {
    cascade: true,
    eager: true,
  })
  galleryImages: CafeImage [];

    @Column()
    openingTime:string;
    @Column()
    closingTime:string
    
    @CreateDateColumn({type:'timestamp',default:()=>CURRENT_TIMESTAMP})
    createdAt:Date
    @UpdateDateColumn({type:'timestamp',default:()=>CURRENT_TIMESTAMP,onUpdate:CURRENT_TIMESTAMP})
    updateAt:Date

    @OneToMany(() => Comment, (comment) => comment.cafe,{ eager: true })
    comments: Comment[];

    @OneToMany(() => Product, (product) => product.cafe)
  products: Product[];

   @OneToMany(() => Love, (love) => love.cafe)
  loves: Love[];

    // **إضافة علاقة One-to-Many مع TableBookings**
  @OneToMany(() => TableBooking, (booking) => booking.cafe)
  tableBookings: TableBooking[];
}

// src/table-booking/table-booking.module.ts
// src/table-booking/table-booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableBookingService } from './table-booking.service';
import { TableBookingController } from './table-booking.controller';
import { TableBooking } from './table-booking.entity';
import { User } from '../users/user.entity';
import { Cafe } from '../cafe/cafe.entity';
import { UsersModule } from '../users/users.module';
import { NotificationModule } from '../notification/notification.module'; // **استيراد جديد**

@Module({
  imports: [
    TypeOrmModule.forFeature([TableBooking, User, Cafe]),
    UsersModule,
    NotificationModule, // **إضافة NotificationModule هنا**
  ],
  controllers: [TableBookingController],
  providers: [TableBookingService],
  exports: [TableBookingService],
})
export class TableBookingModule {}

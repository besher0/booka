import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { NotificationModule } from 'src/notification/notification.module';
import { Rating } from './rating.entity';
import { User } from 'src/users/user.entity';
import { Cafe } from 'src/cafe/cafe.entity';

@Module({
  imports: [
    // **تسجيل جميع المستودعات المطلوبة (Rating, User, Cafe) هنا**
    TypeOrmModule.forFeature([Rating, User, Cafe]), // **إضافة Rating, User, Cafe هنا**
    UsersModule,
    NotificationModule,
  ],
  controllers: [RatingController],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}

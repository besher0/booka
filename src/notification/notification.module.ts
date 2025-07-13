/* eslint-disable prettier/prettier */
// src/notification/notification.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { User } from '../users/user.entity'; // كيان المستخدم
// إذا كنت تستخدم كيان الجهاز:
import { Device } from '../device/device.entity';
import { UsersModule } from '../users/users.module'; // إذا كنت تستخدم AuthGuard
import { ConfigModule } from '@nestjs/config'; // إذا كنت تستخدم ConfigService

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Device]), // تسجيل كيان User و Device هنا
    UsersModule, // استيراد AuthModule
    ConfigModule, // استيراد ConfigModule
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService], // إذا كنت تريد استخدام NotificationService في أماكن أخرى
})
export class NotificationModule {}
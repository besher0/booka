/* eslint-disable prettier/prettier */
// src/device/device.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { Device } from './device.entity';
import { User } from '../users/user.entity'; // استيراد كيان المستخدم
import { UsersModule } from '../users/users.module'; // إذا كنت تستخدم AuthGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, User]), // تسجيل كيان Device و User هنا
    UsersModule, // استيراد AuthModule (لأن Controller يستخدم AuthGuard)
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService], // لتصدير DeviceService إذا احتجت استخدامه في وحدات أخرى
})
export class DeviceModule {}
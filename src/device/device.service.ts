/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
// src/device/device.service.ts
import { Injectable, NotFoundException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm'; // أضف In
import { Device } from './device.entity';
import { User } from '../users/user.entity';

// DTOs
export class RegisterDeviceDto {
  fcmToken: string;
  deviceName?: string;
}

// DTO جديد للتسجيل اليدوي من المسؤول (يشمل userId)
export class AdminRegisterDeviceDto {
    userId: number; // معرف المستخدم لربط الجهاز به
    fcmToken: string;
    deviceName?: string;
}

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // **هذه الدالة ستُستخدم لتسجيل/تحديث الجهاز من تطبيق العميل (عندما يكون لديك)**
  async registerOrUpdateDevice(userId: number, registerDeviceDto: RegisterDeviceDto): Promise<Device> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    let device = await this.deviceRepository.findOne({ where: { fcmToken: registerDeviceDto.fcmToken } });

    if (device) {
      device.deviceName = registerDeviceDto.deviceName || device.deviceName;
      device.user = user;
    } else {
      device = this.deviceRepository.create({
        fcmToken: registerDeviceDto.fcmToken,
        deviceName: registerDeviceDto.deviceName,
        user,
      });
    }
    return this.deviceRepository.save(device);
  }

  // **دالة جديدة: لتسجيل أو تحديث جهاز بواسطة مسؤول (للاختبار اليدوي)**
  async adminRegisterDevice(adminRegisterDeviceDto: AdminRegisterDeviceDto): Promise<Device> {
    const { userId, fcmToken, deviceName } = adminRegisterDeviceDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    let device = await this.deviceRepository.findOne({ where: { fcmToken: fcmToken } });

    if (device) {
      device.deviceName = deviceName || device.deviceName;
      device.user = user;
    } else {
      device = this.deviceRepository.create({
        fcmToken,
        deviceName,
        user,
      });
    }
    return this.deviceRepository.save(device);
  }

  // **دالة جديدة: لحذف جهاز بواسطة مسؤول (للاختبار اليدوي)**
  async adminRemoveDevice(fcmToken: string): Promise<void> {
    const result = await this.deviceRepository.delete({ fcmToken });
    if (result.affected === 0) {
      throw new NotFoundException('Device not found with provided FCM token.');
    }
  }

  // **دالة جديدة: لجلب جميع الأجهزة (للمسؤول)**
  async adminFindAllDevices(): Promise<Device[]> {
    return this.deviceRepository.find({ relations: ['user'] });
  }

  // دالة لجلب أجهزة مستخدم معين (يمكن استخدامها في النوتيفيكيشن سيرفيس)
  async findUserDevices(userId: number): Promise<Device[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return this.deviceRepository.find({ where: { user: { id: userId } } });
  }

  // دالة تجلب رموز FCM للمستخدمين (مستخدمة في NotificationService)
  async getFcmTokensForUsers(userIds: number[]): Promise<string[]> {
    const devices = await this.deviceRepository.find({
        where: { user: { id: In(userIds) } }, // استخدام In لجلب الأجهزة للمستخدمين المتعددين
        select: ['fcmToken'],
    });
    return devices.map(device => device.fcmToken).filter(token => token !== null && token !== undefined) as string[];
  }
}
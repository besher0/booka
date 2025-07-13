/* eslint-disable prettier/prettier */
// src/device/device.controller.ts
// src/device/device.controller.ts
import { Controller, Post, Body, UseGuards, Delete, Param, HttpCode, HttpStatus, Get, BadRequestException } from '@nestjs/common';
import { DeviceService, AdminRegisterDeviceDto } from './device.service'; // استيراد DTOs الجديدة
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserType } from '../utils/enums'; // لليتحقق من صلاحيات المسؤول
import { Device } from './device.entity';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  // **نقطة نهاية (API) لتسجيل/تحديث الجهاز من تطبيق العميل (لا نحتاجها الآن للاختبار الخلفي)**
  // @UseGuards(AuthGuard)
  // @Post('register')
  // @HttpCode(HttpStatus.OK)
  // async registerDevice(
  //   @CurrentUser() user: User,
  //   @Body() registerDeviceDto: RegisterDeviceDto,
  // ): Promise<Device> {
  //   return this.deviceService.registerOrUpdateDevice(user.id, registerDeviceDto);
  // }

  // **نقطة نهاية (API) للمسؤول: لتسجيل/تحديث الأجهزة يدوياً (للاختبار)**
  @UseGuards(AuthGuard)
  @Post('admin/register')
  @HttpCode(HttpStatus.OK)
  async adminRegisterDevice(
    @CurrentUser() adminUser: User,
    @Body() adminRegisterDeviceDto: AdminRegisterDeviceDto, // استخدام DTO المسؤول
  ): Promise<Device> {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException('Only admin users can register devices.');
    }
    return this.deviceService.adminRegisterDevice(adminRegisterDeviceDto);
  }

  // **نقطة نهاية (API) للمسؤول: لحذف الأجهزة يدوياً (للاختبار)**
  @UseGuards(AuthGuard)
  @Delete('admin/:fcmToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminRemoveDevice(
    @CurrentUser() adminUser: User,
    @Param('fcmToken') fcmToken: string,
  ): Promise<void> {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException('Only admin users can remove devices.');
    }
    return this.deviceService.adminRemoveDevice(fcmToken);
  }

  // **نقطة نهاية (API) للمسؤول: لعرض جميع الأجهزة المسجلة (للاختبار)**
  @UseGuards(AuthGuard)
  @Get('admin/all')
  async adminFindAllDevices(@CurrentUser() adminUser: User): Promise<Device[]> {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException('Only admin users can view all devices.');
    }
    return this.deviceService.adminFindAllDevices();
  }

  // نقطة نهاية لجلب جميع أجهزة المستخدم الحالي (تبقى إذا كنت تحتاجها لاحقاً)
  // @UseGuards(AuthGuard)
  // @Get('my-devices')
  // async getMyDevices(@CurrentUser() user: User): Promise<Device[]> {
  //   return this.deviceService.findUserDevices(user.id);
  // }
}
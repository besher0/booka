/* eslint-disable prettier/prettier */
// src/device/device.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { DeviceService, AdminRegisterDeviceDto, RegisterDeviceDto } from './device.service';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserType } from '../utils/enum/enums';
import { Device } from './device.entity';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Device')
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

@UseGuards(AuthGuard)
@Post('register')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Register or update user device FCM token' })
@ApiBody({ type: RegisterDeviceDto })
  @ApiBearerAuth("access-token")
@ApiResponse({ status: 200, description: 'Device registered or updated', type: Device })
async registerDeviceForUser(
  @CurrentUser() user: User,
  @Body() dto: RegisterDeviceDto,
): Promise<Device> {
  return this.deviceService.registerOrUpdateDevice(user.id, dto);
}


  @UseGuards(AuthGuard)
  @Post('admin/register')
  @HttpCode(HttpStatus.OK)
    @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Admin registers a new device (FCM token)' })
  @ApiBody({ type: AdminRegisterDeviceDto })
  @ApiResponse({ status: 200, description: 'Device registered or updated', type: Device })
  @ApiResponse({ status: 400, description: 'Only admin users can register devices' })
  async adminRegisterDevice(
    @CurrentUser() adminUser: User,
    @Body() adminRegisterDeviceDto: AdminRegisterDeviceDto,
  ): Promise<Device> {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException('Only admin users can register devices.');
    }
    return this.deviceService.adminRegisterDevice(adminRegisterDeviceDto);
  }

  @UseGuards(AuthGuard)
  @Delete('admin/:fcmToken')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Admin deletes a device by FCM token' })
  @ApiParam({ name: 'fcmToken', description: 'The FCM token of the device' })
  @ApiResponse({ status: 204, description: 'Device deleted successfully' })
  @ApiResponse({ status: 400, description: 'Only admin users can remove devices' })
  async adminRemoveDevice(
    @CurrentUser() adminUser: User,
    @Param('fcmToken') fcmToken: string,
  ): Promise<void> {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException('Only admin users can remove devices.');
    }
    return this.deviceService.adminRemoveDevice(fcmToken);
  }

  @UseGuards(AuthGuard)
  @Get('admin/all')
  @ApiOperation({ summary: 'Admin gets all registered devices' })
  @ApiResponse({ status: 200, description: 'List of all registered devices', type: [Device] })
  @ApiResponse({ status: 400, description: 'Only admin users can view devices' })
  async adminFindAllDevices(
    @CurrentUser() adminUser: User,
  ): Promise<Device[]> {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException('Only admin users can view all devices.');
    }
    return this.deviceService.adminFindAllDevices();
  }
}

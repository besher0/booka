/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserType } from 'src/utils/enum/enums';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

// --------------------
// DTOs
// --------------------

export class SendNotificationToAllDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  data?: { [key: string]: string };
}

export class SendNotificationToSpecificDto extends SendNotificationToAllDto {
  @IsArray()
  @IsNotEmpty()
  userIds: number[];
}

export class UpdateTokenDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @IsOptional()
  @IsString()
  deviceName?: string;
}

// --------------------
// Controller
// --------------------

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('update-token')
  @ApiOperation({ summary: 'Update FCM token for a user' })
  @ApiBody({ type: UpdateTokenDto })
  @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
  async updateToken(@Body() updateTokenDto: UpdateTokenDto) {
    const { userId, fcmToken, deviceName } = updateTokenDto;

    if (!userId || !fcmToken) {
      throw new BadRequestException('userId and fcmToken are required');
    }

    await this.notificationService.updateFcmToken(userId, fcmToken, deviceName);
    return { message: 'FCM token updated successfully' };
  }

  @UseGuards(AuthGuard)
  @Post('send-to-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin sends notification to all users' })
  @ApiBody({ type: SendNotificationToAllDto })
  @ApiResponse({ status: 200, description: 'Notification sent to all users' })
  @ApiResponse({ status: 400, description: 'Only admin users can perform this action' })
  async sendToAll(
    @CurrentUser() adminUser: User,
    @Body() notificationDto: SendNotificationToAllDto,
  ) {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException(
        'Only admin users can send notifications to all.',
      );
    }

    return this.notificationService.sendToAllUsers(
      notificationDto.title,
      notificationDto.body,
      notificationDto.data,
    );
  }

  @UseGuards(AuthGuard)
  @Post('send-to-specific')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin sends notification to specific users' })
  @ApiBody({ type: SendNotificationToSpecificDto })
  @ApiResponse({ status: 200, description: 'Notification sent to specific users' })
  @ApiResponse({ status: 400, description: 'Only admin users can perform this action' })
  async sendToSpecific(
    @CurrentUser() adminUser: User,
    @Body() notificationDto: SendNotificationToSpecificDto,
  ) {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException(
        'Only admin users can send notifications to specific users.',
      );
    }

    return this.notificationService.sendToSpecificUsers(
      notificationDto.userIds,
      notificationDto.title,
      notificationDto.body,
      notificationDto.data,
    );
  }
}

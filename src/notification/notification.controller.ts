/* eslint-disable prettier/prettier */
import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../users/guards/auth.guard'; // جارد المصادقة
import { CurrentUser } from '../users/decorators/current-user.decorator'; // ديكور الحصول على المستخدم
import { User } from '../users/user.entity'; // كيان المستخدم
import { UserType } from 'src/utils/enum/enums';

// DTOs للرسائل
class SendNotificationToAllDto {
  title: string;
  body: string;
  data?: { [key: string]: string };
}

class SendNotificationToSpecificDto extends SendNotificationToAllDto {
  userIds: number[]; // قائمة بمعرفات المستخدمين المستهدفين
}

class UpdateTokenDto {
  userId: number;
  fcmToken: string;
  deviceName?: string;
}

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // **نقطة نهاية (API) لتحديث توكن FCM**
  @Post('update-token')
  async updateToken(@Body() updateTokenDto: UpdateTokenDto) {
    const { userId, fcmToken, deviceName } = updateTokenDto;
    if (!userId || !fcmToken) {
      throw new BadRequestException('userId and fcmToken are required');
    }
    await this.notificationService.updateFcmToken(userId, fcmToken, deviceName);
    return { message: 'FCM token updated successfully' };
  }

  // **نقطة نهاية (API) للمسؤول: إرسال إشعار لجميع المستخدمين**
  @UseGuards(AuthGuard)
  @Post('send-to-all')
  async sendToAll(@CurrentUser() adminUser: User, @Body() notificationDto: SendNotificationToAllDto) {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException('Only admin users can send notifications to all.');
    }
    return this.notificationService.sendToAllUsers(notificationDto.title, notificationDto.body, notificationDto.data);
  }

  // **نقطة نهاية (API) للمسؤول: إرسال إشعار لأشخاص معينين**
  @UseGuards(AuthGuard)
  @Post('send-to-specific')
  async sendToSpecific(@CurrentUser() adminUser: User, @Body() notificationDto: SendNotificationToSpecificDto) {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new BadRequestException('Only admin users can send notifications to specific users.');
    }
    return this.notificationService.sendToSpecificUsers(
      notificationDto.userIds,
      notificationDto.title,
      notificationDto.body,
      notificationDto.data,
    );
  }
}

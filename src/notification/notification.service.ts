/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/notification/notification.service.ts

import { Injectable, Inject, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Device } from '../device/device.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject('FIREBASE_ADMIN') private readonly messaging: admin.messaging.Messaging, // ✅ هنا التعديل
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Device) private readonly deviceRepository: Repository<Device>,
  ) {}

  async sendToAllUsers(title: string, body: string, data?: { [key: string]: string }) {
    const message: admin.messaging.Message = {
      notification: { title, body },
      data,
      topic: 'all_users',
    };

    try {
      const response = await this.messaging.send(message);
      this.logger.log(`Notification sent to all users successfully: ${response}`);
      return response;
    } catch (error) {
      this.logger.error(`Error sending notification to all users: ${error.message}`);
      throw new BadRequestException('Failed to send notification to all users.');
    }
  }

  async sendToSpecificUsers(userIds: number[], title: string, body: string, data?: { [key: string]: string }) {
    const devices = await this.deviceRepository.find({
      where: { user: { id: In(userIds) } },
      select: ['fcmToken'],
    });

    const tokens = devices.map(d => d.fcmToken).filter(Boolean) as string[];

    if (tokens.length === 0) {
      this.logger.warn('No FCM tokens found for the specified users.');
      return { success: false, message: 'No valid tokens to send to.' };
    }

    const message: admin.messaging.MulticastMessage = {
      notification: { title, body },
      data,
      tokens,
    };

    try {
      const response = await this.messaging.sendEachForMulticast(message);
      this.logger.log(`Notification sent to ${response.successCount} of ${tokens.length} specific users.`);
      if (response.failureCount > 0) {
        this.logger.warn(`Failed to send to ${response.failureCount} tokens: ${JSON.stringify(response.responses.filter(r => !r.success))}`);
      }
      return response;
    } catch (error) {
      this.logger.error(`Error sending notification to specific users: ${error.message}`);
      throw new BadRequestException('Failed to send notification to specific users.');
    }
  }

  async updateFcmToken(userId: number, fcmToken: string, deviceName?: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found.`);

    let device = await this.deviceRepository.findOne({ where: { fcmToken } });
    if (device) {
      device.deviceName = deviceName || device.deviceName;
      device.user = user;
    } else {
      device = this.deviceRepository.create({ fcmToken, deviceName, user });
    }
    await this.deviceRepository.save(device);

    await this.messaging.subscribeToTopic(fcmToken, 'all_users');
  }

  async removeFcmToken(fcmToken: string): Promise<void> {
    const device = await this.deviceRepository.findOne({ where: { fcmToken } });
    if (device) {
      await this.deviceRepository.remove(device);
      await this.messaging.unsubscribeFromTopic(fcmToken, 'all_users');
    }
  }
}

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/table-booking/table-booking.controller.ts
import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, HttpCode, HttpStatus, BadRequestException, ForbiddenException, ParseIntPipe } from '@nestjs/common';
import { TableBookingService } from './table-booking.service';
import { CreateTableBookingDto } from './dto/create-table-booking.dto';
import { UpdateTableBookingDto } from './dto/update-table-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UserType } from '../utils/enum/enums';
import { BookingStatus } from '../utils/enum/booking-status.enum';

@Controller('table-bookings')
export class TableBookingController {
  constructor(private readonly tableBookingService: TableBookingService) {}

  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: User,
    @Body() createBookingDto: CreateTableBookingDto,
  ) {
    return this.tableBookingService.create(user.id, createBookingDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@CurrentUser() adminUser: User) {
    if (adminUser.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admin users can view all bookings.');
    }
    return this.tableBookingService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: number) {
  //   return this.tableBookingService.FindOne(+id);
  // }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id',ParseIntPipe) id: string,
    @Body() updateBookingDto: UpdateTableBookingDto,
    @CurrentUser() user: User,
  ) {
    // يمكن هنا إضافة منطق للتحقق من أن المستخدم هو صاحب الحجز أو مسؤول
    return this.tableBookingService.update(+user.id, updateBookingDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    // يمكن هنا إضافة منطق للتحقق من أن المستخدم هو صاحب الحجز أو مسؤول
    return this.tableBookingService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Get('my-bookings')
  async findMyBookings(@CurrentUser() user: User) {
    console.log('User object received:', user); // طبع كائن المستخدم بالكامل
  console.log('User ID from @CurrentUser():', user.id, 'Type:', typeof user.id); // طبع الـ ID ونوعه
    return this.tableBookingService.findUserBookings(+user.id);
  }

  @UseGuards(AuthGuard)
  @Get('cafe/:cafeId')
  async findCafeBookings(@Param('cafeId') cafeId: string, @CurrentUser() user: User) {
    // يمكن هنا إضافة منطق للتحقق من صلاحيات المسؤول أو أن المستخدم هو صاحب الكافيه
    return this.tableBookingService.findCafeBookings(+cafeId);
  }

  // **نقطة نهاية لتحديث حالة الحجز (للمسؤول فقط)**
  @UseGuards(AuthGuard)
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateBookingStatus(
    @Param('id') bookingId: string,
    @Body() updateStatusDto: UpdateBookingStatusDto,
    @CurrentUser() user: User, // المستخدم الذي يقوم بالتحديث
  ) {
    // **التحقق من الصلاحيات في المتحكم:**
    // فقط المسؤولون (ADMIN) يمكنهم تغيير حالة الحجز.
    if (user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admin users are authorized to update booking status.');
    }

    // تحقق إضافي: إذا كانت الحالة مرفوضة، يجب أن يكون هناك سبب للرفض
    if (updateStatusDto.status === BookingStatus.REJECTED && !updateStatusDto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required when rejecting a booking.');
    }

    // إذا كانت الحالة ليست مرفوضة، تأكد من عدم وجود سبب رفض غير ضروري
    if (updateStatusDto.status !== BookingStatus.REJECTED) {
        updateStatusDto.rejectionReason = undefined;
    }

    return this.tableBookingService.updateBookingStatus(
      +bookingId,
      user.id, // تمرير معرف المسؤول الذي قام بالتحديث
      updateStatusDto,
    );
  }
}
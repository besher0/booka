/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';

import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

import { TableBookingService } from './table-booking.service';
import { CreateTableBookingDto } from './dto/create-table-booking.dto';
import { UpdateTableBookingDto } from './dto/update-table-booking.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UserType } from '../utils/enum/enums';

@ApiTags('table-bookings')
@ApiBearerAuth() // يوضح أن هذا الكونترولر يستخدم توكن (JWT مثلاً)
@Controller('table-bookings')
export class TableBookingController {
  constructor(private readonly tableBookingService: TableBookingService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new table booking' })
    @ApiBearerAuth("access-token")
  @ApiResponse({ status: 201, description: 'Booking created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiBody({ type: CreateTableBookingDto })
  async create(
    @Body() createTableBookingDto: CreateTableBookingDto,
    @CurrentUser() user: User,
  ) {
    return this.tableBookingService.create(user.id, createTableBookingDto);
  }

  @UseGuards(AuthGuard)
  @Get()
      @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get all table bookings (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all bookings.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findAll(@CurrentUser() user: User) {
    if (user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only administrators can view all bookings.');
    }
    return this.tableBookingService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('my-bookings')
        @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get bookings of the current logged-in user' })
  @ApiResponse({ status: 200, description: 'List of user bookings.' })
  async findMyBookings(@CurrentUser() user: User) {
    return this.tableBookingService.findUserBookings(user.id);
  }

  @Get(':id')
        @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get booking details by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Booking ID' })
  @ApiResponse({ status: 200, description: 'Booking details.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tableBookingService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
        @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Update a booking by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Booking ID' })
  @ApiBody({ type: UpdateTableBookingDto })
  @ApiResponse({ status: 200, description: 'Booking updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookingDto: UpdateTableBookingDto,
    @CurrentUser() user: User,
  ) {
    return this.tableBookingService.update(id, updateBookingDto);
  }

  @UseGuards(AuthGuard)
  @Get('cafe/:cafeId')
        @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get bookings by cafe id (admin only)' })
  @ApiParam({ name: 'cafeId', type: Number, description: 'Cafe ID' })
  @ApiResponse({ status: 200, description: 'List of bookings for cafe.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async findCafeBookings(
    @Param('cafeId', ParseIntPipe) cafeId: number,
    @CurrentUser() user: User,
  ) {
    if (user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only administrators can view cafe bookings.');
    }
    return this.tableBookingService.findCafeBookings(cafeId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
        @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a booking by id' })
  @ApiParam({ name: 'id', type: Number, description: 'Booking ID' })
  @ApiResponse({ status: 204, description: 'Booking deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    await this.tableBookingService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Put(':id/status')
        @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update booking status (admin only)' })
  @ApiParam({ name: 'id', type: Number, description: 'Booking ID' })
  @ApiBody({ type: UpdateBookingStatusDto })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async updateBookingStatus(
    @Param('id', ParseIntPipe) bookingId: number,
    @Body() updateStatusDto: UpdateBookingStatusDto,
    @CurrentUser() user: User,
  ) {
    if (user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only administrators can update booking status.');
    }
    return this.tableBookingService.updateBookingStatus(bookingId, user.id, updateStatusDto);
  }
}

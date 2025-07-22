/* eslint-disable prettier/prettier */
// src/advertisement/advertisement.controller.ts
import {
  Controller, Post, Body, Param, Delete, Put, Get, HttpCode, HttpStatus,
  UseGuards, UseInterceptors, UploadedFile, ParseIntPipe, BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

import { AdvertisementService } from './advertisments.service';
import { CreateAdvertisementDto } from './dto/advertiment.createDto';
import { UpdateAdvertisementDto } from './dto/advertisment.updateDto';
import { CreateAdvertisementSwaggerDto } from './dto/create-advertisement-swagger.dto';
import { UpdateAdvertisementSwaggerDto } from './dto/update-advertisement-swagger.dto';
import { uploadsStorage } from '../utils/cloudinary.storageUploads'; // تأكد من المسار الصحيح

import { AuthRolesGuard } from '../users/guards/auth-roles.guard'; // لحماية الأدوار
import { Roles } from '../users/decorators/user-role.decorator'; // لتحديد الأدوار
import { UserType } from '../utils/enum/enums'; // لـ UserType.ADMIN
import { CurrentUser } from '../users/decorators/current-user.decorator'; // لجلب المستخدم الحالي
import { User } from '../users/user.entity'; // لتمثيل المستخدم
import { Advertisement } from './advertisments.entity';


@ApiTags('Advertisements')
@ApiBearerAuth() // جميع Endpoints هنا تتطلب مصادقة Bearer Token
@Controller('api/advertisements')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  // POST: Create new advertisement (Admin only)
  @Post()
  @ApiOperation({ summary: 'Admin: Create a new advertisement' })
  @ApiResponse({ status: 201, description: 'Advertisement created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin role required.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAdvertisementSwaggerDto })
  @UseInterceptors(FileInterceptor('imageFile', { storage: uploadsStorage })) // اسم حقل الملف
  @UseGuards(AuthRolesGuard) // حماية بالدور
  @Roles(UserType.ADMIN) // فقط المسؤول
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createAdvertisementDto: CreateAdvertisementDto,
    @UploadedFile() file: Express.Multer.File, // الصورة مطلوبة عند الإنشاء
    @CurrentUser() adminUser: User, // المستخدم المسؤول الذي قام بالطلب
  ): Promise<Advertisement> {
    if (!file) {
      throw new BadRequestException('Image file is required for creating an advertisement.');
    }
    return this.advertisementService.create(createAdvertisementDto, file, adminUser.id);
  }

  // GET: Get all advertisements
  @Get()
  @ApiOperation({ summary: 'Get all active advertisements' })
  @ApiResponse({ status: 200, description: 'List of advertisements returned successfully.' })
  async findAll(): Promise<Advertisement[]> {
    // يمكنك إضافة فلتر لعرض الإعلانات النشطة فقط هنا إذا لم تكن الخدمة تفعل ذلك
    return this.advertisementService.findAll();
  }

  // GET: Get advertisement by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get advertisement by ID' })
  @ApiResponse({ status: 200, description: 'Advertisement found.' })
  @ApiResponse({ status: 404, description: 'Advertisement not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the advertisement' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Advertisement> {
    return this.advertisementService.findOne(id);
  }

  // PUT: Update advertisement (Admin only)
  @Put(':id')
  @ApiOperation({ summary: 'Admin: Update an existing advertisement' })
  @ApiResponse({ status: 200, description: 'Advertisement updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin role required.' })
  @ApiResponse({ status: 404, description: 'Advertisement not found.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateAdvertisementSwaggerDto })
  @UseInterceptors(FileInterceptor('imageFile', { storage: uploadsStorage })) // اسم حقل الملف
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdvertisementDto: UpdateAdvertisementDto,
    @UploadedFile() file: Express.Multer.File | null | undefined, // الملف اختياري (يمكن أن يكون null للإزالة)
    @CurrentUser() adminUser: User,
  ): Promise<Advertisement> {
    return this.advertisementService.update(id, updateAdvertisementDto, file, adminUser.id);
  }

  // DELETE: Remove advertisement (Admin only)
  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete an advertisement' })
  @ApiResponse({ status: 200, description: 'Advertisement deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin role required.' })
  @ApiResponse({ status: 404, description: 'Advertisement not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the advertisement' })
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() adminUser: User,
  ): Promise<{ message: string }> {
    return this.advertisementService.remove(id, adminUser.id);
  }
}
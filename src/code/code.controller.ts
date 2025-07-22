/* eslint-disable prettier/prettier */
// src/admin-code/admin-code.controller.ts
import { Controller, Post, Body, Get, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminCodeService } from './code.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Roles } from '../users/decorators/user-role.decorator';
import { UserType } from '../utils/enum/enums';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard';
import { AdminCode } from './code.entity';

// DTOs for AdminCode Controller
// هذا DTO لم يعد بحاجة لأي خصائص لأن assignedToUserId لم يعد يُرسل
// class GenerateAdminCodeDto {
//     @ApiProperty({ description: 'معرف المستخدم الذي سيتم تخصيص الكود له (اختياري)', required: false, example: 101 })
//     assignedToUserId?: number;
// }

@ApiTags('Admin Codes')
@ApiBearerAuth()
@UseGuards(AuthRolesGuard)
@Roles(UserType.ADMIN)
@Controller('api/admin-codes')
@ApiBearerAuth("access-token")
export class AdminCodeController {
  constructor(private readonly adminCodeService: AdminCodeService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Admin: Generate a new unique cafe creation code (general purpose)' }) // <--- تحديث الوصف
  @ApiResponse({ status: 201, description: 'Code generated successfully', type: AdminCode })
  @ApiResponse({ status: 400, description: 'Failed to generate unique code' })
  // @ApiBody({ type: GenerateAdminCodeDto, required: false }) // <--- لم يعد بحاجة لـ @ApiBody إذا لم يوجد بارامترات في الـ body
  @HttpCode(HttpStatus.CREATED)
  async generateCode(
    @CurrentUser() adminUser: User, // جلب المستخدم المسؤول الذي يقوم بالطلب
    // @Body() dto: GenerateAdminCodeDto, // <--- لم يعد بحاجة لهذا البارامتر
  ) {
    // لم يعد يمرر assignedToUserId. adminUser.id يُستخدم فقط للتحقق من الدور من قبل الحارس (Guard).
    return this.adminCodeService.generateUniqueCode(adminUser.id);
  }

  @Get()
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Admin: Get all generated codes' })
  @ApiResponse({ status: 200, description: 'List of all admin codes', type: [AdminCode] })
  async getAllCodes() {
    return this.adminCodeService.getAllAdminCodes();
  }

  @Get(':code')
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Admin: Get a specific code by its value' })
  @ApiParam({ name: 'code', description: 'The unique code value', example: 'ABCDEF12' })
  @ApiResponse({ status: 200, description: 'Code found', type: AdminCode })
  @ApiResponse({ status: 404, description: 'Code not found' })
  async getCodeByValue(@Param('code') code: string) {
    return this.adminCodeService.findCode(code);
  }
}
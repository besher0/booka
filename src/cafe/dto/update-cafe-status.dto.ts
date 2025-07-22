/* eslint-disable prettier/prettier */
// src/cafe/dto/update-cafe-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { CafeStatus } from '../../utils/enum/enums'; // تأكد من المسار الصحيح

export class UpdateCafeStatusDto {
  @ApiProperty({
    description: 'الحالة الجديدة للكافيه (موافق عليه أو مرفوض)',
    enum: CafeStatus,
    example: CafeStatus.APPROVED,
  })
  @IsEnum(CafeStatus)
  @IsNotEmpty()
  status: CafeStatus;

  @ApiProperty({
    description: 'سبب الرفض (مطلوب إذا كانت الحالة "مرفوض")',
    required: false,
    example: 'الموقع غير مناسب.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
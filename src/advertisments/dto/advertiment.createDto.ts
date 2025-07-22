/* eslint-disable prettier/prettier */
// src/advertisement/dto/create-advertisement.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class CreateAdvertisementDto {
  @ApiProperty({ description: 'عنوان الإعلان', example: 'تخفيضات الصيف الكبرى!' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: 'الرابط الذي يوجه إليه الإعلان', required: false, example: 'https://yourwebsite.com/summer-sale' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  linkUrl?: string;

  @ApiProperty({ description: 'هل الإعلان نشط فور إنشائه؟', required: false, example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'تاريخ بداية عرض الإعلان (YYYY-MM-DD)', required: false, example: '2025-07-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'تاريخ انتهاء عرض الإعلان (YYYY-MM-DD)', required: false, example: '2025-07-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
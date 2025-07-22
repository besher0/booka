/* eslint-disable prettier/prettier */
// src/advertisement/dto/update-advertisement.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAdvertisementDto } from './advertiment.createDto';
import { IsBoolean, IsDateString, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdvertisementDto extends PartialType(CreateAdvertisementDto) {
  @ApiProperty({ description: 'عنوان الإعلان المحدث', required: false, example: 'تخفيضات الشتاء!' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({ description: 'الرابط المحدث', required: false, example: 'https://yourwebsite.com/winter-sale' })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  linkUrl?: string;

  @ApiProperty({ description: 'هل الإعلان نشط حالياً؟', required: false, example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'تاريخ بداية عرض الإعلان المحدث (YYYY-MM-DD)', required: false, example: '2025-12-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'تاريخ انتهاء عرض الإعلان المحدث (YYYY-MM-DD)', required: false, example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
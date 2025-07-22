/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types'; // نستخدم PartialType من mapped-types
import { CreateRatingDto } from './create-rating.dto';
import { ApiProperty } from '@nestjs/swagger'; // **استيراد Swagger**
import { IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateRatingDto extends PartialType(CreateRatingDto) {
  @ApiProperty({
    example: 4,
    description: 'قيمة التقييم المحدثة (من 1 إلى 5 نجوم)',
    required: false,
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Rating value must be at least 1 star.' })
  @Max(5, { message: 'Rating value must be at most 5 stars.' })
  value?: number;

  // cafeId لا يُحدّث عادةً بعد إنشاء التقييم، لذا لا نضع ApiProperty هنا
}
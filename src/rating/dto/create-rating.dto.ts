/* eslint-disable prettier/prettier */
import { IsNumber, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // **استيراد Swagger**

export class CreateRatingDto {
  @ApiProperty({
    example: 1,
    description: 'معرف الكافيه المراد تقييمه',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  cafeId: number;

  @ApiProperty({
    example: 5,
    description: 'قيمة التقييم (من 1 إلى 5 نجوم)',
    type: Number,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1, { message: 'Rating value must be at least 1 star.' })
  @Max(5, { message: 'Rating value must be at most 5 stars.' })
  value: number;
}
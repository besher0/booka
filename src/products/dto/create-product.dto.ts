/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductType } from 'src/utils/enum/enums';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    example: 'قهوة لاتيه مثلجة',
    description: 'اسم المنتج',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  // @ApiProperty({ // <--- حذف هذا الحقل
  //     example: 'https://example.com/latte.jpg',
  //     description: 'رابط URL لصورة المنتج (اختياري)',
  //     required: false,
  //     type: String,
  //     format: 'url',
  // })
  // @IsOptional()
  // @IsUrl()
  // imageUrl?: string; // <--- حذف هذا الحقل

  @ApiProperty({
    example: 5.50,
    description: 'سعر المنتج',
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiProperty({
    example: 'مشروب',
    description: 'نوع المنتج (مشروب أو مأكولات)',
    enum: ProductType,
  })
  @IsEnum(ProductType)
  @IsNotEmpty()
  type: ProductType;

  @ApiProperty({
    example: 1,
    description: 'معرف الكافيه الذي ينتمي إليه المنتج',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  cafeId: number;
}
/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ProductType } from 'src/utils/enum/enums';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    example: 'قهوة اسبريسو',
    description: 'اسم المنتج المحدث',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  // @ApiProperty({ // <--- حذف هذا الحقل
  //     example: 'https://example.com/espresso.jpg',
  //     description: 'رابط URL جديد لصورة المنتج (اختياري)',
  //     required: false,
  //     type: String,
  //     format: 'url',
  // })
  // @IsOptional()
  // @IsUrl()
  // imageUrl?: string; // <--- حذف هذا الحقل

  @ApiProperty({
    example: 4.00,
    description: 'سعر المنتج المحدث',
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    example: 'مأكولات',
    description: 'نوع المنتج المحدث',
    enum: ProductType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiProperty({
    example: 2,
    description: 'معرف الكافيه المحدث الذي ينتمي إليه المنتج (لا يُغير عادةً)',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  cafeId?: number;
}
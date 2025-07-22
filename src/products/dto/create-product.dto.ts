/* eslint-disable prettier/prettier */
// src/product/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsUrl, IsOptional, IsEnum, Min } from 'class-validator';
import { ProductType } from 'src/utils/enum/enums';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;


  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsEnum(ProductType)
  @IsNotEmpty()
  type: ProductType;

  // **معرف الكافيه الذي ينتمي إليه المنتج (إلزامي عند الإنشاء)**
  @IsNumber()
  @IsNotEmpty()
  cafeId: number;
}
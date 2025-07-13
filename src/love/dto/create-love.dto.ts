/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/love/dto/create-love.dto.ts
import { IsNumber, IsOptional, ValidateIf } from 'class-validator';

export class CreateLoveDto {
  @IsOptional()
  @IsNumber({}, { message: 'cafeId must be a number if provided.' })
  @ValidateIf(o => o.cafeId !== undefined || (o.productId === undefined && o.commentId === undefined))
  cafeId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'productId must be a number if provided.' })
  @ValidateIf(o => o.productId !== undefined || (o.cafeId === undefined && o.commentId === undefined))
  productId?: number;

  @IsOptional()
  @IsNumber({}, { message: 'commentId must be a number if provided.' })
  @ValidateIf(o => o.commentId !== undefined || (o.cafeId === undefined && o.productId === undefined))
  commentId?: number;

  // يمكن إضافة تحقق مخصص هنا للتأكد من وجود واحد فقط
  // For example, using a custom validator or checking in the service
}
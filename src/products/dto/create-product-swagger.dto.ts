/* eslint-disable prettier/prettier */
// src/products/dto/create-product-swagger.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto'; // استيراد CreateProductDto

export class CreateProductSwaggerDto extends CreateProductDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ملف صورة المنتج (صيغ مدعومة: JPG, PNG, GIF, BMP, WebP)',
    required: false, // الصورة اختيارية عند الإنشاء
  })
  imageFile?: Express.Multer.File; // اسم الحقل الذي تتوقعه للملف
}
/* eslint-disable prettier/prettier */
// src/products/dto/update-product-swagger.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UpdateProductDto } from './update-product.dto'; // استيراد UpdateProductDto

export class UpdateProductSwaggerDto extends PartialType(UpdateProductDto) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ملف صورة المنتج الجديد (صيغ مدعومة: JPG, PNG, GIF, BMP, WebP). أرسل حقلًا فارغًا لحذف الصورة الحالية.',
    required: false,
    nullable: true, // للسماح بقيمة null إذا أردت حذف الصورة
  })
  imageFile?: Express.Multer.File | null; // اسم الحقل الذي تتوقعه للملف
}
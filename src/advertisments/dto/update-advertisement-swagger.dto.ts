/* eslint-disable prettier/prettier */
// src/advertisement/dto/update-advertisement-swagger.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UpdateAdvertisementDto } from './advertisment.updateDto';

export class UpdateAdvertisementSwaggerDto extends PartialType(UpdateAdvertisementDto) {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ملف صورة الإعلان الجديد (اختياري). أرسل حقلًا فارغًا لحذف الصورة الحالية.',
    required: false, // الصورة اختيارية عند التحديث
    nullable: true,  // يسمح بإرسال null
  })
  imageFile?: Express.Multer.File | null; // اسم الحقل الذي تتوقعه للملف
}
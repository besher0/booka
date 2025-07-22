/* eslint-disable prettier/prettier */
// src/advertisement/dto/create-advertisement-swagger.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CreateAdvertisementDto } from './advertiment.createDto';

export class CreateAdvertisementSwaggerDto extends CreateAdvertisementDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'ملف صورة الإعلان (مطلوب). صيغ مدعومة: JPG, PNG, GIF, BMP, WebP.',
    required: true, // الصورة مطلوبة عند الإنشاء
  })
  imageFile: Express.Multer.File; // اسم الحقل الذي تتوقعه للملف
}
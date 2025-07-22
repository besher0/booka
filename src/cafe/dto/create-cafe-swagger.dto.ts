/* eslint-disable prettier/prettier */
// src/cafe/dto/create-cafe-swagger.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { CreateCafe } from './create-cafe.dto'; // استيراد CreateCafe DTO

export class CreateCafeSwaggerDto extends CreateCafe { // يرث الخصائص من CreateCafe
  @ApiProperty({ type: 'string', format: 'binary', description: 'الصورة الرئيسية للكافيه' })
  mainImageFile: Express.Multer.File; // اسم الحقل الذي تتوقعه للملف الرئيسي

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'صور المعرض للكافيه (حتى 10 صور)', required: false })
  galleryImageFiles: Array<Express.Multer.File>; // اسم الحقل الذي تتوقعه لصور المعرض
}


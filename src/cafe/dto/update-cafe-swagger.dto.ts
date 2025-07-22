/* eslint-disable prettier/prettier */
// src/cafe/dto/update-cafe-swagger.dto.ts
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { UpdateCafe } from './update-cafe.dto'; // استيراد UpdateCafe DTO

// هذا DTO مخصص فقط لتوثيق Swagger لطلب PUT/PATCH مع الملفات
// لا يتم استخدامه كـ type لـ @Body() في Controller
export class UpdateCafeSwaggerDto extends PartialType(UpdateCafe) { // يرث الخصائص من UpdateCafe
  @ApiProperty({ type: 'string', format: 'binary', description: 'الصورة الرئيسية الجديدة للكافيه', required: false })
  mainImageFile?: Express.Multer.File|null; // اسم الحقل الذي تتوقعه للملف الرئيسي

  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' }, description: 'صور المعرض الجديدة للكافيه (حتى 10 صور)', required: false })
  galleryImageFiles?: Array<Express.Multer.File>|null; // اسم الحقل الذي تتوقعه لصور المعرض
}
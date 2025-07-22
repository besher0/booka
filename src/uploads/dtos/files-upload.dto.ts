/* eslint-disable no-irregular-whitespace */
/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
// import { Express } from "express"; // إذا كنت تستخدم types من express

export class FilesUploadDto {
    @ApiProperty({
        type: 'array',
        name: 'files',
        items: { type: 'string', format: 'binary' }, // 'binary' للإشارة إلى ملف
        description: 'قائمة بالملفات المراد رفعها',
    })
    files: Array<any>; // استخدم any هنا لأن Express.Multer.File قد لا يكون معرفاً مباشرة
                     // أو إذا كنت تستورد Express: files: Array<Express.Multer.File>
}

/* eslint-disable no-irregular-whitespace */
/* eslint-disable prettier/prettier */
// src/uploads/uploads.module.ts
import { BadRequestException, Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { MulterModule } from "@nestjs/platform-express";
// import * as path from 'path';
import { ImageModule } from '../uploads/image.module'; // المسار يجب أن يكون '../image/image.module'

// استيراد Cloudinary Storage الجديد
import { uploadsStorage } from '../utils/cloudinary.storageUploads'; // <--- استيراد التخزين الجديد

@Module({
    controllers: [UploadsController],
    imports: [
        MulterModule.register({
            storage: uploadsStorage, // <--- استخدم Cloudinary Storage هنا بدلاً من diskStorage
            fileFilter: (req, file, cb) => {
                // يمكنك إزالة هذا الـ fileFilter إذا كنت تستخدم resource_type: 'auto' في CloudinaryStorage
                // أو تعديله ليناسب أنواع الملفات المتعددة
                if (file.mimetype.startsWith('image')) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('تنسيق الملف غير مدعوم. يُسمح بالصور فقط.'), false);
                }
            },
            limits: { fileSize: 1024 * 1024 * 20 } // حد حجم الملف: 20 ميغابايت
        }),
        ImageModule, // تأكد من أن المسار هنا صحيح (يجب أن يكون ImageModule في مجلد image)
    ]
})
export class UploadsModule { }
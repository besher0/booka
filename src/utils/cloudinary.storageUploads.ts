/* eslint-disable prettier/prettier */
/*eslint-disable no-irregular-whitespace */
// src/utils/cloudinary.storageUploads.ts
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config'; // تأكد أن هذا المسار صحيح

export const uploadsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params:  (req, file) => { // أبقِها async لضمان المرونة المستقبلية
    const uniqueId = `${Date.now()}}`; 

    return {
      folder: 'general_uploads', // <--- تأكد من وجود مجلد هنا
      public_id: uniqueId, // استخدام المتغير الذي تم التحقق منه
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'], // أضف صيغاً أخرى إذا لزم الأمر
      transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }], // تحويل افتراضي للصور
    };
  },
});
/* eslint-disable prettier/prettier */
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const storage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: 'products',           // مجلد الصور
    allowed_formats: ['jpg', 'png'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  }),
});


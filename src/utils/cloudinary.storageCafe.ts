/* eslint-disable prettier/prettier */
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.config';

export const storage = new CloudinaryStorage({
  cloudinary,
  params:()=>( {
    folder: 'cafes',
    allowed_formats: ['jpg', 'png'],
    transformation: [{ width: 1000, height: 800, crop: 'limit' }],
  }),})

//   export default cloudinary
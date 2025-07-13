/* eslint-disable prettier/prettier */
import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV}` });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

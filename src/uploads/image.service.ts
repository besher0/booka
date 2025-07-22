/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
// src/image/image.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // <--- إضافة DataSource هنا
import { Image } from './image.entity'; // <--- المسار المصحح

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    private dataSource: DataSource // <--- حقن DataSource
  ) {}

  /**
   * يحفظ بيانات وصف الصورة (metadata) في قاعدة البيانات.
   * @param filename الاسم الفريد للملف على Cloudinary (public_id).
   * @param filePath الرابط الكامل للصورة على Cloudinary.
   * @param mimetype نوع MIME للملف.
   * @param size حجم الملف بالبايت.
   * @returns كيان الصورة المحفوظ مع معرفها (ID).
   */
  async createImage(filename: string, filePath: string, mimetype: string, size: number): Promise<Image> {
    if (!filename || !filePath) {
      throw new Error('Filename or Filepath cannot be empty for Image creation.');
    }
    const newImage = this.imagesRepository.create({ filename, filePath, mimetype, size });
    return this.imagesRepository.save(newImage);
  }

  /**
   * يبحث عن سجل صورة بواسطة معرفها (ID) في قاعدة البيانات.
   * @param id المعرف (ID) الخاص بالصورة في قاعدة البيانات.
   * @returns كيان الصورة أو null إذا لم يتم العثور عليه.
   */
  async findImageById(id: number): Promise<Image | null> {
    return this.imagesRepository.findOneBy({ id });
  }

  /**
   * يبحث عن سجل صورة بواسطة اسمها الفريد للملف.
   * @param filename الاسم الفريد للملف على القرص.
   * @returns كيان الصورة أو null إذا لم يتم العثور عليه.
   */
  async findImageByFilename(filename: string): Promise<Image | null> {
    return this.imagesRepository.findOneBy({ filename });
  }

  /**
   * يحذف سجل صورة من قاعدة البيانات بواسطة معرفها (ID).
   * @param id المعرف (ID) الخاص بالصورة المراد حذفها.
   */
  async deleteImageRecord(id: number): Promise<void> {
    // 1. **هام:** أولاً، قم بإزالة جميع المراجع من جدول الوصل يدوياً
    //    هذا يضمن عدم انتهاك قيد المفتاح الأجنبي عند حذف الصورة
    try {
        await this.dataSource
            .createQueryBuilder()
            .delete()
            .from('cafe_gallery_images') // <--- اسم جدول الوصل الخاص بك (تأكد من أنه صحيح)
            .where('imageId = :id', { id }) // العمود الذي يشير إلى Image ID في جدول الوصل
            .execute();
        console.log(`References to Image ID ${id} deleted from cafe_gallery_images.`);
    } catch (joinTableError) {
        console.error(`Failed to delete references for Image ID ${id} from join table:`, joinTableError);
        // يمكنك اختيار رمي خطأ أو السماح بالاستمرار حسب أهمية هذه المراجع
    }

    // 2. الآن، احذف سجل الصورة نفسه
    const result = await this.imagesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`سجل الصورة بالمعرف ${id} لم يتم العثور عليه.`);
    }
  }

  // يمكنك إضافة المزيد من الطرق هنا إذا لزم الأمر، مثل getAllImages.
}
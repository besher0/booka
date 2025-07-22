/* eslint-disable prettier/prettier */
// src/cafe/cafe.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cafe } from './cafe.entity';
import { CreateCafe } from './dto/create-cafe.dto';
import { UpdateCafe } from './dto/update-cafe.dto';
import { ImageService } from '../uploads/image.service';
import { Image } from '../uploads/image.entity';
import { v2 as cloudinary } from 'cloudinary';
import { UsersService } from '../users/users.service';
import { CafeStatus, UserType } from '../utils/enum/enums';
import { AdminCodeService } from '../code/code.service';
import { UpdateCafeStatusDto } from './dto/update-cafe-status.dto';


@Injectable()
export class CafeService {
  constructor(
    @InjectRepository(Cafe)
    private readonly cafeRepository: Repository<Cafe>,
    private readonly imageService: ImageService,
    private readonly usersService: UsersService,
    private readonly adminCodeService: AdminCodeService,
  ) {}

  // دالة مساعدة لحذف صورة من Cloudinary
  private async deleteImageFromCloudinary(publicId: string): Promise<void> {
    try {
      if (!publicId) {
        console.warn('Public ID is missing for Cloudinary deletion. Skipping deletion.');
        return;
      }
      await cloudinary.uploader.destroy(publicId);
      console.log(`Image with public ID ${publicId} deleted from Cloudinary.`);
    } catch (error) {
      console.error(
        `Failed to delete image ${publicId} from Cloudinary:`,
        error,
      );
      throw new BadRequestException(`Failed to delete image ${publicId} from Cloudinary.`);
    }
  }

  // POST: Create a new cafe with images
  public async addcafe(
    createCafeDto: CreateCafe,
    ownerId: number,
    mainImageFile?: Express.Multer.File | null,
    galleryFiles?: Express.Multer.File[] | null,
  ) {
    const ownerUser = await this.usersService.getCurrentUser(ownerId);
    if (!ownerUser) {
      throw new NotFoundException(`المستخدم المالك بالمعرف ${ownerId} لم يتم العثور عليه.`);
    }
    // **تحقق الصلاحية: فقط مالكو المقاهي يمكنهم إنشاء مقهى**
    if (ownerUser.userType !== UserType.CAFE_OWNER) {
        throw new ForbiddenException('Only cafe owners are authorized to create a cafe.');
    }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
    const usedAdminCode = await this.adminCodeService.validateAndUseCode(
      createCafeDto.adminCode,
      ownerUser.id
    );

    const newCafe = this.cafeRepository.create(createCafeDto);
    newCafe.owner = ownerUser;
    newCafe.ownerId = ownerUser.id;
    newCafe.status = CafeStatus.PENDING;

    if (mainImageFile) {
      if (!mainImageFile.filename || !mainImageFile.path) {
        throw new BadRequestException('Main image file data (filename/path) is missing after upload.');
      }
      const mainImageRecord = await this.imageService.createImage(
        mainImageFile.filename,
        mainImageFile.path,
        mainImageFile.mimetype,
        mainImageFile.size,
      );
      newCafe.mainImage = mainImageRecord;
      newCafe.mainImageId = mainImageRecord.id;
    }

    const galleryImageRecords: Image[] = [];
    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        if (!file.filename || !file.path) {
          console.warn(`Gallery file data (filename/path) is missing for ${file.originalname || 'unknown file'}. Skipping.`);
          continue;
        }
        const imageRecord = await this.imageService.createImage(
          file.filename,
          file.path,
          file.mimetype,
          file.size,
        );
        galleryImageRecords.push(imageRecord);
      }
    }
    newCafe.galleryImages = galleryImageRecords;

    const savedCafe = await this.cafeRepository.save(newCafe);

    return savedCafe;
  }

  public async getAllCafes(filters: { name?: string; type?: string; location?: string }, isAdmin: boolean = false) {
      const query = this.cafeRepository.createQueryBuilder('cafe');
      query.leftJoinAndSelect('cafe.mainImage', 'mainImage');
      query.leftJoinAndSelect('cafe.galleryImages', 'galleryImage');

      if (!isAdmin) { // فقط للمستخدمين غير المسؤولين، اظهر الموافق عليها فقط
          query.andWhere('cafe.status = :status', { status: CafeStatus.APPROVED });
      }
      if (filters.name) {
        query.andWhere('LOWER(cafe.name) LIKE LOWER(:name)', {
          name: `%${filters.name}%`,
        });
      }
      if (filters.type) {
        query.andWhere('LOWER(cafe.type) LIKE LOWER(:type)', {
          type: `%${filters.type}%`,
        });
      }
      if (filters.location) {
        query.andWhere('LOWER(cafe.location) LIKE LOWER(:location)', {
          location: `%${filters.location}%`,
        });
      }
      return query.getMany();
    }

  public async getOneById(id: number) {
    const cafe = await this.cafeRepository.findOne({
      where: { id },
      relations: ['mainImage', 'galleryImages'],
    });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${id} not found.`);
    }
    return cafe;
  }

  public async updateCafe(
    id: number,
    updateCafeDto: UpdateCafe,
    currentUserId: number, // **تمت إضافة currentUserId للتحقق من الصلاحيات**
    mainImageFile?: Express.Multer.File | null,
    galleryFiles?: Express.Multer.File[] | null,
  ) {
    const cafe = await this.cafeRepository.findOne({
      where: { id },
      relations: ['mainImage', 'galleryImages', 'owner'], // **تحميل المالك للتحقق من الصلاحيات**
    });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${id} not found.`);
    }

    // **تحقق الصلاحية: فقط مالك المقهى يمكنه تحديث بياناته**
    if (cafe.ownerId !== currentUserId) {
        throw new ForbiddenException('You are not authorized to update this cafe. Only the owner can make changes.');
    }

    if (updateCafeDto.name !== undefined) cafe.name = updateCafeDto.name;
    if (updateCafeDto.type !== undefined) cafe.type = updateCafeDto.type;
    if (updateCafeDto.description !== undefined) cafe.description = updateCafeDto.description;
    if (updateCafeDto.location !== undefined) cafe.location = updateCafeDto.location;
    if (updateCafeDto.openingTime !== undefined) cafe.openingTime = updateCafeDto.openingTime;
    if (updateCafeDto.closingTime !== undefined) cafe.closingTime = updateCafeDto.closingTime;

    if (mainImageFile !== undefined) {
      if (mainImageFile === null) {
        if (cafe.mainImage) {
          await this.deleteImageFromCloudinary(cafe.mainImage.filename);
          await this.imageService.deleteImageRecord(cafe.mainImage.id);
        }
        cafe.mainImage = null;
        cafe.mainImageId = null;
      } else {
        if (cafe.mainImage && cafe.mainImage.id) {
          await this.deleteImageFromCloudinary(cafe.mainImage.filename);
          await this.imageService.deleteImageRecord(cafe.mainImage.id);
        }
        if (!mainImageFile.filename || !mainImageFile.path) {
          throw new BadRequestException('Main image file data (filename/path) is missing for new upload.');
        }
        const newMainImageRecord = await this.imageService.createImage(
          mainImageFile.filename,
          mainImageFile.path,
          mainImageFile.mimetype,
          mainImageFile.size,
        );
        cafe.mainImage = newMainImageRecord;
        cafe.mainImageId = newMainImageRecord.id;
      }
    }

    // معالجة تحديث صور المعرض فقط إذا تم توفير ملفات المعرض بشكل صريح (ليست undefined)
    // إذا كانت galleryFiles هي undefined، فهذا يعني أن العميل لم يرسل ملفات معرض جديدة، لذلك نحتفظ بالملفات الموجودة.
    // إذا كانت galleryFiles عبارة عن مصفوفة فارغة، فهذا يعني أن العميل يريد مسح المعرض صراحةً.
    if (galleryFiles !== undefined) {
      const oldGalleryImages = [...cafe.galleryImages];
      cafe.galleryImages = []; // مسح مؤقت لإعادة الربط بشكل صحيح
      await this.cafeRepository.save(cafe); // حفظ لقطع العلاقات

      const newGalleryImageRecords: Image[] = [];
      if (galleryFiles && galleryFiles.length > 0) {
        for (const file of galleryFiles) {
          if (!file.filename || !file.path) {
            console.warn(`Gallery file data (filename/path) is missing for ${file.originalname || 'unknown file'}. Skipping.`);
            continue;
          }
          const imageRecord = await this.imageService.createImage(
            file.filename,
            file.path,
            file.mimetype,
            file.size,
          );
          newGalleryImageRecords.push(imageRecord);
        }
      }
      cafe.galleryImages = newGalleryImageRecords;
      await this.cafeRepository.save(cafe);

      for (const oldImage of oldGalleryImages) {
        await this.deleteImageFromCloudinary(oldImage.filename);
        await this.imageService.deleteImageRecord(oldImage.id);
      }
    }

    return this.cafeRepository.save(cafe);
  }

  public async updateCafeGallery(
    id: number,
    currentUserId: number, // **تمت إضافة currentUserId للتحقق من الصلاحيات**
    newGalleryFiles: Express.Multer.File[],
  ) {
    const cafe = await this.cafeRepository.findOne({
      where: { id },
      relations: ['galleryImages', 'owner'], // **تحميل المالك للتحقق من الصلاحيات**
    });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${id} not found.`);
    }

    // **تحقق الصلاحية: فقط مالك المقهى يمكنه تحديث المعرض**
    if (cafe.ownerId !== currentUserId) {
        throw new ForbiddenException('You are not authorized to update this cafe\'s gallery. Only the owner can make changes.');
    }

    const oldGalleryImages = [...cafe.galleryImages];
    cafe.galleryImages = [];
    await this.cafeRepository.save(cafe);

    const newGalleryImageRecords: Image[] = [];
    if (newGalleryFiles && newGalleryFiles.length > 0) {
      for (const file of newGalleryFiles) {
        if (!file.filename || !file.path) {
          console.warn(`Gallery file data (filename/path) is missing for ${file.originalname || 'unknown file'}. Skipping.`);
          continue;
        }
        const imageRecord = await this.imageService.createImage(
          file.filename,
          file.path,
          file.mimetype,
          file.size,
        );
        newGalleryImageRecords.push(imageRecord);
      }
    }
    cafe.galleryImages = newGalleryImageRecords;
    await this.cafeRepository.save(cafe);

    for (const oldImage of oldGalleryImages) {
      await this.deleteImageFromCloudinary(oldImage.filename);
      await this.imageService.deleteImageRecord(oldImage.id);
    }

    return this.cafeRepository.save(cafe);
  }

  public async addToGallery(
    id: number,
    currentUserId: number, // **تمت إضافة currentUserId للتحقق من الصلاحيات**
    addGalleryFiles: Express.Multer.File[],
  ) {
    const cafe = await this.cafeRepository.findOne({
      where: { id },
      relations: ['galleryImages', 'owner'], // **تحميل المالك للتحقق من الصلاحيات**
    });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${id} not found.`);
    }

    // **تحقق الصلاحية: فقط مالك المقهى يمكنه إضافة صور إلى المعرض**
    if (cafe.ownerId !== currentUserId) {
        throw new ForbiddenException('You are not authorized to add images to this cafe\'s gallery. Only the owner can make changes.');
    }

    if (addGalleryFiles && addGalleryFiles.length > 0) {
      const newImageRecords: Image[] = [];
      for (const file of addGalleryFiles) {
        if (!file.filename || !file.path) {
          console.warn(`Gallery file data (filename/path) is missing for ${file.originalname || 'unknown file'}. Skipping.`);
          continue;
        }
        const imageRecord = await this.imageService.createImage(
          file.filename,
          file.path,
          file.mimetype,
          file.size,
        );
        newImageRecords.push(imageRecord);
      }
      cafe.galleryImages.push(...newImageRecords);
    }
    return this.cafeRepository.save(cafe);
  }

  public async delete(id: number, currentUserId: number) { // **تمت إضافة currentUserId للتحقق من الصلاحيات**
    const cafe = await this.cafeRepository.findOne({
      where: { id },
      relations: ['mainImage', 'galleryImages', 'owner'], // **تحميل المالك للتحقق من الصلاحيات**
    });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${id} not found.`);
    }

    const currentUser = await this.usersService.getCurrentUser(currentUserId);
    if (!currentUser) {
        throw new NotFoundException('Current user not found.');
    }

    // **تحقق الصلاحية: فقط مالك المقهى أو المسؤول يمكنه حذف المقهى**
    if (cafe.ownerId !== currentUserId && currentUser.userType !== UserType.ADMIN) {
        throw new ForbiddenException('You are not authorized to delete this cafe. Only the owner or an Admin can delete it.');
    }

    if (cafe.mainImage) {
      await this.deleteImageFromCloudinary(cafe.mainImage.filename);
      await this.imageService.deleteImageRecord(cafe.mainImage.id);
    }

    const galleryImageIdsToDelete = cafe.galleryImages.map(img => img.id);
    cafe.galleryImages = [];
    await this.cafeRepository.save(cafe);

    for (const imageId of galleryImageIdsToDelete) {
      const imageRecord = await this.imageService.findImageById(imageId);
      if (imageRecord) {
        await this.deleteImageFromCloudinary(imageRecord.filename);
        await this.imageService.deleteImageRecord(imageRecord.id);
      }
    }

    const result = await this.cafeRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cafe with ID ${id} not found for deletion.`);
    }
    return { message: 'Cafe and associated images deleted successfully.' };
  }

  public async deleteGalleryImage(cafeId: number, imageId: number, currentUserId: number) { // **تمت إضافة currentUserId**
    const cafe = await this.cafeRepository.findOne({
      where: { id: cafeId },
      relations: ['galleryImages', 'owner'], // **تحميل المالك للتحقق من الصلاحيات**
    });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${cafeId} not found.`);
    }

    // **تحقق الصلاحية: فقط مالك المقهى يمكنه حذف صورة من المعرض**
    if (cafe.ownerId !== currentUserId) {
      throw new ForbiddenException('You are not authorized to delete images from this cafe\'s gallery. Only the owner can make changes.');
    }

    const imageToDelete = cafe.galleryImages.find((img) => img.id === imageId);
    if (!imageToDelete) {
      throw new NotFoundException(
        `Image with ID ${imageId} not found in gallery for cafe ${cafeId}.`,
      );
    }

    cafe.galleryImages = cafe.galleryImages.filter((img) => img.id !== imageId);
    await this.cafeRepository.save(cafe);

    await this.deleteImageFromCloudinary(imageToDelete.filename);
    await this.imageService.deleteImageRecord(imageId);

    return {
      message: `Image with ID ${imageId} deleted from gallery for cafe ${cafeId}.`,
    };
  }

  public async updateCafeStatus(
    id: number,
    adminUserId: number,
    dto: UpdateCafeStatusDto,
  ) {
    const cafe = await this.cafeRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${id} not found.`);
    }
    const adminUser = await this.usersService.getCurrentUser(adminUserId);
    if (!adminUser || adminUser.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admin users are authorized to update cafe status.');
    }
    if (
      cafe.status === CafeStatus.APPROVED ||
      cafe.status === CafeStatus.REJECTED ||
      cafe.status === CafeStatus.DISABLED
    ) {
      if (dto.status === CafeStatus.PENDING) {
        throw new BadRequestException(`Cannot change status to PENDING from ${cafe.status}.`);
      }
    }
    if (dto.status === CafeStatus.REJECTED && !dto.rejectionReason) {
      throw new BadRequestException('Rejection reason is required when rejecting a cafe.');
    }
    if (dto.status !== CafeStatus.REJECTED) {
        cafe.rejectionReason = null;
    } else {
        cafe.rejectionReason = dto.rejectionReason;
    }
    cafe.status = dto.status;
    const updatedCafe = await this.cafeRepository.save(cafe);
    return { message: `Cafe status updated successfully to ${updatedCafe.status}`, cafe: updatedCafe };
  }
}
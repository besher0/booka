/* eslint-disable prettier/prettier */
// src/advertisement/advertisement.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advertisement } from './advertisments.entity';
import { CreateAdvertisementDto } from './dto/advertiment.createDto';
import { UpdateAdvertisementDto } from './dto/advertisment.updateDto';
import { ImageService } from '../uploads/image.service'; // تأكد من المسار الصحيح
import { v2 as cloudinary } from 'cloudinary'; // لاستخدام Cloudinary SDK للحذف المباشر
import { UsersService } from '../users/users.service'; // إذا كنت تحتاج التحقق من دور المستخدم
import { UserType } from '../utils/enum/enums'; // لـ UserType.ADMIN


@Injectable()
export class AdvertisementService {
  constructor(
    @InjectRepository(Advertisement)
    private advertisementRepository: Repository<Advertisement>,
    private readonly imageService: ImageService,
    private readonly usersService: UsersService, // حقن UsersService
  ) {}

  // دالة مساعدة لحذف صورة من Cloudinary (مكررة، يمكن نقلها إلى utility)
  private async deleteImageFromCloudinary(publicId: string): Promise<void> {
    try {
      if (!publicId) {
        console.warn('Public ID is missing for Cloudinary deletion. Skipping deletion.');
        return;
      }
      await cloudinary.uploader.destroy(publicId);
      console.log(`Image with public ID ${publicId} deleted from Cloudinary.`);
    } catch (error) {
      console.error(`Failed to delete image ${publicId} from Cloudinary:`, error);
      throw new BadRequestException(`Failed to delete image ${publicId} from Cloudinary.`);
    }
  }

  // POST: Create a new advertisement
  async create(createAdvertisementDto: CreateAdvertisementDto, imageFile: Express.Multer.File, adminUserId: number): Promise<Advertisement> {
    const adminUser = await this.usersService.getCurrentUser(adminUserId);
    if (!adminUser || adminUser.userType !== UserType.ADMIN) {
        throw new ForbiddenException('Only admin users are authorized to create advertisements.');
    }

    if (!imageFile || !imageFile.filename || !imageFile.path) {
      throw new BadRequestException('Image file is required and its data (filename/path) must be valid.');
    }

    const imageRecord = await this.imageService.createImage(
      imageFile.filename,
      imageFile.path,
      imageFile.mimetype,
      imageFile.size,
    );

    const newAdvertisement = this.advertisementRepository.create({
      ...createAdvertisementDto,
      image: imageRecord,
      imageId: imageRecord.id,
      startDate: createAdvertisementDto.startDate ? new Date(createAdvertisementDto.startDate) : undefined,
      endDate: createAdvertisementDto.endDate ? new Date(createAdvertisementDto.endDate) : undefined,
    });

    return this.advertisementRepository.save(newAdvertisement);
  }

  // GET: Get all advertisements
  async findAll(): Promise<Advertisement[]> {
    return this.advertisementRepository.find({ relations: ['image'] });
  }

  // GET: Get advertisement by ID
  async findOne(id: number): Promise<Advertisement> {
    const advertisement = await this.advertisementRepository.findOne({ where: { id }, relations: ['image'] });
    if (!advertisement) {
      throw new NotFoundException(`Advertisement with ID ${id} not found.`);
    }
    return advertisement;
  }

  // PUT: Update an advertisement
  async update(id: number, updateAdvertisementDto: UpdateAdvertisementDto, imageFile: Express.Multer.File | null | undefined, adminUserId: number): Promise<Advertisement> {
    const advertisement = await this.findOne(id); // Use findOne to get the existing advertisement
    const adminUser = await this.usersService.getCurrentUser(adminUserId);
    if (!adminUser || adminUser.userType !== UserType.ADMIN) {
        throw new ForbiddenException('Only admin users are authorized to update advertisements.');
    }

    Object.assign(advertisement, updateAdvertisementDto);
    
    // Handle image update
    if (imageFile !== undefined) { // Check if the 'imageFile' field was sent in the request
      if (imageFile === null) { // User wants to remove the image
        if (advertisement.image) { // If there was an existing image
          await this.deleteImageFromCloudinary(advertisement.image.filename);
          await this.imageService.deleteImageRecord(advertisement.image.id);
        }
        advertisement.image = null; // Detach image
        advertisement.imageId = null; // Clear foreign key
      } else { // User provided a new image file
        if (!imageFile.filename || !imageFile.path) {
          throw new BadRequestException('New image file data (filename/path) is missing after upload.');
        }
        if (advertisement.image) { // Delete old image if exists
          await this.deleteImageFromCloudinary(advertisement.image.filename);
          await this.imageService.deleteImageRecord(advertisement.image.id);
        }
        // Create and link new image
        const newImageRecord = await this.imageService.createImage(
          imageFile.filename,
          imageFile.path,
          imageFile.mimetype,
          imageFile.size,
        );
        advertisement.image = newImageRecord;
        advertisement.imageId = newImageRecord.id;
      }
    }
    // If imageFile is undefined, the image remains unchanged.

    // Handle date strings conversion
    if (updateAdvertisementDto.startDate !== undefined) {
      advertisement.startDate = updateAdvertisementDto.startDate ? new Date(updateAdvertisementDto.startDate) : null;
    }
    if (updateAdvertisementDto.endDate !== undefined) {
      advertisement.endDate = updateAdvertisementDto.endDate ? new Date(updateAdvertisementDto.endDate) : null;
    }

    return this.advertisementRepository.save(advertisement);
  }

  // DELETE: Remove an advertisement
  async remove(id: number, adminUserId: number): Promise<{ message: string }> {
    const advertisement = await this.findOne(id); // Use findOne to get the existing advertisement

    const adminUser = await this.usersService.getCurrentUser(adminUserId);
    if (!adminUser || adminUser.userType !== UserType.ADMIN) {
        throw new ForbiddenException('Only admin users are authorized to delete advertisements.');
    }

    if (advertisement.image) { // Delete associated image from Cloudinary and DB
      await this.deleteImageFromCloudinary(advertisement.image.filename);
      await this.imageService.deleteImageRecord(advertisement.image.id);
    }

    const result = await this.advertisementRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Advertisement with ID ${id} not found.`);
    }
    return { message: 'Advertisement deleted successfully' };
  }
}
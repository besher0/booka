/* eslint-disable prettier/prettier */
// src/cafe/cafe.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CafeService } from './cafe.service';
import { CreateCafe } from './dto/create-cafe.dto';
import { UpdateCafe } from './dto/update-cafe.dto';
import { FileFieldsInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

import { CreateCafeSwaggerDto } from './dto/create-cafe-swagger.dto';
import { UpdateCafeSwaggerDto } from './dto/update-cafe-swagger.dto';
import { uploadsStorage } from '../utils/cloudinary.storageUploads';
import { User } from '../users/user.entity';
import { UserType } from '../utils/enum/enums';
import { AuthRolesGuard } from '../users/guards/auth-roles.guard';
import { Roles } from '../users/decorators/user-role.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { AuthGuard } from 'src/users/guards/auth.guard';
import { UpdateCafeStatusDto } from './dto/update-cafe-status.dto';
import { Cafe } from './cafe.entity';


@ApiTags('Cafes')
@Controller('api/cafe')
export class CafesController {
  constructor(private readonly CafesService: CafeService) {}


  @Post('/')
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Create a new cafe with main image and gallery images (requires authentication by Cafe Owner)' })
  @ApiResponse({ status: 201, description: 'The cafe has been successfully submitted for approval.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only cafe owners can create a cafe.' }) // **أضف هذا الوصف**
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCafeSwaggerDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'mainImageFile', maxCount: 1 },
    { name: 'galleryImageFiles', maxCount: 10 },
  ], { storage: uploadsStorage }))
  @UseGuards(AuthGuard, AuthRolesGuard) // **استخدم AuthRolesGuard أيضًا**
  @Roles(UserType.CAFE_OWNER) // **حدد أن الدور المطلوب هو مالك المقهى فقط**
  @HttpCode(HttpStatus.CREATED)
  public async addCafe(
    @Body() createCafeDto: CreateCafe,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @CurrentUser() user: User, // جلب المستخدم الحالي كمالك
  ) {
    let mainImageFile: Express.Multer.File | undefined | null;
    let galleryFiles: Express.Multer.File[] | undefined | null;

    if (files.mainImageFile && files.mainImageFile.length > 0) {
      mainImageFile = files.mainImageFile[0];
    } else if ('mainImageFile' in files && files.mainImageFile?.length === 0) {
      mainImageFile = null;
    }

    if (files.galleryImageFiles !== undefined) {
      galleryFiles = files.galleryImageFiles;
    }
    return this.CafesService.addcafe(createCafeDto, user.id, mainImageFile, galleryFiles);
  }

  @Get('/')
  @ApiOperation({ summary: 'Get all cafes with optional filters (only approved for normal users)' })
  @ApiResponse({ status: 200, description: 'List of cafes returned successfully' })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiBearerAuth() // قد يتطلب مصادقة (اختياري)
  async getAllCafes(
    @Query('name') name?: string,
    @Query('type') type?: string,
    @Query('location') location?: string,
    @CurrentUser() user?: User, // جلب المستخدم الحالي (اختياري للسماح للعامة بالجلب)
  ) {
    const isAdmin = user && user.userType === UserType.ADMIN;
    return this.CafesService.getAllCafes({ name, type, location }, isAdmin);
  }

  @Get('/admin/all')
  @ApiOperation({ summary: 'Admin: Get all cafes with any status' })
  @ApiResponse({ status: 200, description: 'List of all cafes, regardless of status.' })
  @ApiBearerAuth("access-token")
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  async getAllCafesAdmin(
    @Query('name') name?: string,
    @Query('type') type?: string,
    @Query('location') location?: string,
  ) {
    return this.CafesService.getAllCafes({ name, type, location }, true); // isAdmin = true
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a cafe by ID with its main image and gallery images' })
  @ApiResponse({ status: 200, description: 'Returns the cafe details.' })
  @ApiResponse({ status: 404, description: 'Cafe not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'Unique ID of the cafe' })
  public getcafeById(@Param('id', ParseIntPipe) id: number) {
    return this.CafesService.getOneById(id);
  }

  @Put('/:id')
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Update a cafe with new data and optional image replacements (Owner only)' })
  @ApiResponse({ status: 200, description: 'Cafe updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only the cafe owner can update this cafe.' }) // **أضف هذا الوصف**
  @ApiResponse({ status: 404, description: 'Cafe not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'Unique ID of the cafe to update' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateCafeSwaggerDto })
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'mainImageFile', maxCount: 1 },
    { name: 'galleryImageFiles', maxCount: 10 },
  ], { storage: uploadsStorage }))
  @UseGuards(AuthGuard, AuthRolesGuard) // **استخدم AuthRolesGuard أيضًا**
  @Roles(UserType.CAFE_OWNER) // **حدد أن الدور المطلوب هو مالك المقهى فقط**
  @HttpCode(HttpStatus.OK)
  public async updateCafe(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCafeDto: UpdateCafe,
    @UploadedFiles() files: Record<string, Express.Multer.File[]>,
    @CurrentUser() user: User, // **جلب المستخدم الحالي**
  ) {
    let mainImageFile: Express.Multer.File | undefined | null;
    let galleryFiles: Express.Multer.File[] | undefined | null;

    if (files.mainImageFile && files.mainImageFile.length > 0) {
      mainImageFile = files.mainImageFile[0];
    } else if ('mainImageFile' in files && files.mainImageFile?.length === 0) {
      mainImageFile = null;
    }

    if (files.galleryImageFiles !== undefined) {
      galleryFiles = files.galleryImageFiles;
    }

    return this.CafesService.updateCafe(id, updateCafeDto, user.id, mainImageFile, galleryFiles); // **تمرير user.id**
  }

  @Post(':id/gallery')
  @ApiBearerAuth("access-token") // **أضف هذا**
  @UseGuards(AuthGuard, AuthRolesGuard) // **أضف هذا**
  @Roles(UserType.CAFE_OWNER) // **أضف هذا**
  @ApiOperation({ summary: 'Replace entire gallery for cafe with new images, saving metadata to DB (Owner only)' })
  @ApiResponse({ status: 200, description: 'Gallery updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only the cafe owner can update this cafe\'s gallery.' }) // **أضف هذا الوصف**
  @ApiResponse({ status: 404, description: 'Cafe not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the cafe to update gallery for' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        galleryImages: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 10,
          description: 'قائمة صور المعرض الجديدة لاستبدال المعرض الحالي (بحد أقصى 10 صور).',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('galleryImages', 10, { storage: uploadsStorage }))
  @HttpCode(HttpStatus.OK)
  async updateCafeGallery(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User, // **جلب المستخدم الحالي**
  ) {
    return this.CafesService.updateCafeGallery(id, user.id, files); // **تمرير user.id**
  }

  @Post(':id/gallery/add')
  @ApiBearerAuth("access-token") // **أضف هذا**
  @UseGuards(AuthGuard, AuthRolesGuard) // **أضف هذا**
  @Roles(UserType.CAFE_OWNER) // **أضف هذا**
  @ApiOperation({ summary: 'Add images to cafe gallery, saving metadata to DB (Owner only)' })
  @ApiResponse({ status: 200, description: 'Images added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only the cafe owner can add images to this cafe\'s gallery.' }) // **أضف هذا الوصف**
  @ApiResponse({ status: 404, description: 'Cafe not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the cafe to add images to gallery' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        galleryImages: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 10,
          description: 'صور لإضافتها إلى المعرض الحالي (بحد أقصى 10 صور إضافية).',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('galleryImages', 10, { storage: uploadsStorage }))
  @HttpCode(HttpStatus.OK)
  async addToCafeGallery(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User, // **جلب المستخدم الحالي**
  ) {
    return this.CafesService.addToGallery(id, user.id, files); // **تمرير user.id**
  }

  @Delete('/:id')
  @ApiBearerAuth("access-token") // **تأكد من وجود هذا**
  @UseGuards(AuthGuard, AuthRolesGuard) // **استخدم AuthGuard أيضًا لضمان وجود المستخدم**
  @Roles(UserType.CAFE_OWNER, UserType.ADMIN)
  @ApiOperation({ summary: 'Delete a cafe by ID and all its associated images from DB and Cloudinary (Owner or Admin only)' })
  @ApiResponse({ status: 200, description: 'Cafe and all associated images deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: User is not cafe owner or Admin.' })
  @ApiResponse({ status: 404, description: 'Cafe not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'Unique ID of the cafe to delete' })
  public deleteCafe(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User, // جلب المستخدم الحالي
  ) {
    return this.CafesService.delete(id, user.id); // تمرير userId
  }

  @Delete(':cafeId/gallery/:imageId')
  @ApiBearerAuth("access-token")
  @UseGuards(AuthGuard, AuthRolesGuard)
  @Roles(UserType.CAFE_OWNER) // **تم تعديل هذا ليسمح فقط لمالك المقهى بالحذف**
  @ApiOperation({ summary: 'Delete a specific image from a cafe gallery by its Image ID (Owner only)' }) // **تم تعديل الوصف**
  @ApiResponse({ status: 200, description: 'Image removed from gallery and deleted from database/Cloudinary successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden: Only the cafe owner can delete images from this cafe\'s gallery.' }) // **تم تعديل الوصف**
  @ApiResponse({ status: 404, description: 'Cafe or Image not found in gallery' })
  @ApiParam({ name: 'cafeId', type: Number, description: 'ID of the cafe' })
  @ApiParam({ name: 'imageId', type: Number, description: 'ID of the specific image to delete from the gallery' })
  public async deleteGalleryImage(
    @Param('cafeId', ParseIntPipe) cafeId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @CurrentUser() user: User, // **جلب المستخدم الحالي لتمريره للخدمة**
  ) {
    return this.CafesService.deleteGalleryImage(cafeId, imageId, user.id); // **تمرير user.id للخدمة**
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Admin: Update cafe status (Approve, Reject, Disable)' })
  @ApiResponse({ status: 200, description: 'Cafe status updated successfully.', type: Cafe })
  @ApiResponse({ status: 403, description: 'Forbidden (Admin only).' })
  @ApiResponse({ status: 404, description: 'Cafe not found.' })
  @ApiResponse({ status: 400, description: 'Invalid status transition or missing rejection reason.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the cafe to update status for' })
  @ApiBody({ type: UpdateCafeStatusDto })
  @ApiBearerAuth("access-token")
  @UseGuards(AuthRolesGuard)
  @Roles(UserType.ADMIN)
  async updateCafeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCafeStatusDto: UpdateCafeStatusDto,
    @CurrentUser() adminUser: User,
  ) {
    return this.CafesService.updateCafeStatus(id, adminUser.id, updateCafeStatusDto);
  }
}
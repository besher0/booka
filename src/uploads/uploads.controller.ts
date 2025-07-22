/* eslint-disable prettier/prettier */
import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    Get,
    Param,
    Delete,
    NotFoundException,
    HttpStatus,
    ParseIntPipe,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { Express, Response } from "express";
import {
    ApiConsumes,
    ApiBody,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiNotFoundResponse,
    ApiBadRequestResponse,
} from "@nestjs/swagger";
import { FilesUploadDto } from "./dtos/files-upload.dto";
// import * as fs from 'fs'; // هذا لم يعد ضرورياً إذا كنت لا تعمل مع التخزين المحلي
// import * as path from 'path'; // هذا لم يعد ضرورياً إذا كنت لا تعمل مع التخزين المحلي
import { ImageService } from '../uploads/image.service'; // <--- المسار يجب أن يكون '../image/image.service'
import { Image } from '../uploads/image.entity'; // <--- المسار يجب أن يكون '../image/image.entity'
import { v2 as cloudinary } from 'cloudinary'; // <--- استيراد Cloudinary للحذف

@ApiTags('Uploads')
@Controller("api/uploads")
export class UploadsController {
    constructor(private readonly imageService: ImageService) {}

    // POST: ~/api/uploads (رفع ملف واحد)
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'رفع ملف صورة واحد وحفظ بياناته الوصفية في قاعدة البيانات' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'ملف الصورة المراد رفعه (صيغ مدعومة: JPG, PNG, GIF, BMP, WebP)',
                },
            },
        },
        description: 'رفع ملف صورة واحد.',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'تم رفع الملف وحفظ بياناته الوصفية بنجاح.',
        schema: {
            example: {
                message: 'تم رفع الملف بنجاح وحفظ بياناته الوصفية.',
                id: 1,
                public_id: 'image_public_id', // أصبحت public_id
                url: 'http://res.cloudinary.com/your_cloud/image_public_id.jpg' // رابط Cloudinary
            }
        }
    })
    @ApiBadRequestResponse({ description: 'لم يتم توفير ملف أو تنسيق ملف غير مدعوم.' })
    public async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("لم يتم توفير ملف.");
        }
        // file.filename هنا هو الـ public_id من CloudinaryStorage
        // file.path هنا هو الـ URL الكامل للصورة على Cloudinary
        console.log("File uploaded to Cloudinary:", { public_id: file.filename, url: file.path });
        const imageRecord = await this.imageService.createImage(
            file.filename, // حفظ public_id كـ filename في DB
            file.originalname,
            file.mimetype,
            file.size
        );
        return {
            message: "تم رفع الملف بنجاح وحفظ بياناته الوصفية.",
            id: imageRecord.id,
            public_id: imageRecord.filename, // public_id
            url: file.path // رابط Cloudinary
        };
    }

    // POST: ~/api/uploads/multiple-files (رفع ملفات متعددة)
    @Post('multiple-files')
    @UseInterceptors(FilesInterceptor('files'))
    @ApiOperation({ summary: 'رفع ملفات صور متعددة وحفظ بياناتها الوصفية في قاعدة البيانات' })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        type: FilesUploadDto,
        description: 'رفع ملفات صور متعددة (صيغ مدعومة: JPG, PNG, GIF, BMP, WebP)',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'تم رفع الملفات وحفظ بياناتها الوصفية بنجاح.',
        schema: {
            example: {
                message: 'تم رفع الملفات بنجاح وحفظ بياناتها الوصفية.',
                ids: [1, 2, 3],
                public_ids: ['id1', 'id2', 'id3'],
                urls: ['url1', 'url2', 'url3']
            }
        }
    })
    @ApiBadRequestResponse({ description: 'لم يتم توفير ملفات أو تنسيق ملف غير مدعوم.' })
    public async uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
        if (!files || files.length === 0) {
            throw new BadRequestException("لم يتم توفير ملفات.");
        }

        const uploadedImageRecords: Image[] = [];
        const publicIds: string[] = [];
        const urls: string[] = [];

        for (const file of files) {
            console.log("File uploaded to Cloudinary:", { public_id: file.filename, url: file.path });
            const imageRecord = await this.imageService.createImage(
                file.filename,
                file.originalname,
                file.mimetype,
                file.size
            );
            uploadedImageRecords.push(imageRecord);
            publicIds.push(file.filename);
            urls.push(file.path);
        }

        const ids = uploadedImageRecords.map(record => record.id);
        
        return {
            message: "تم رفع الملفات بنجاح وحفظ بياناتها الوصفية.",
            ids: ids,
            public_ids: publicIds,
            urls: urls
        };
    }

    // GET: ~/api/uploads/:id (استرجاع صورة بواسطة ID)
    @Get(":id")
    @ApiOperation({ summary: 'استرجاع صورة مرفوعة بواسطة معرفها (ID) من قاعدة البيانات' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'المعرف (ID) الخاص بالصورة في قاعدة البيانات.',
        example: 1
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'تم استرجاع رابط الصورة بنجاح.',
        schema: { example: { public_id: 'image_public_id', url: 'http://res.cloudinary.com/your_cloud/image_public_id.jpg' } }
    })
    @ApiNotFoundResponse({ description: 'لم يتم العثور على سجل الصورة.' })
    public async showUploadedImage(@Param("id") id: number) { // <--- لم نعد نحتاج @Res() و fs/path
        const imageRecord = await this.imageService.findImageById(id);
        if (!imageRecord) {
            throw new NotFoundException(`سجل الصورة بالمعرف ${id} لم يتم العثور عليه في قاعدة البيانات.`);
        }

        // بناء رابط Cloudinary بناءً على الـ public_id
        // هذا يعتمد على إعداداتك في Cloudinary (مثل السحابة، التحويلات)
        const imageUrl = cloudinary.url(imageRecord.filename, { secure: true }); // <--- بناء URL الصورة

        return { public_id: imageRecord.filename, url: imageUrl };
    }

    // DELETE: ~/api/uploads/:id (حذف صورة بواسطة ID)
    @Delete(':id')
    @ApiOperation({ summary: 'حذف صورة مرفوعة بواسطة معرفها (ID) من قاعدة البيانات وحذف ملفها من Cloudinary' })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'المعرف (ID) الخاص بالصورة في قاعدة البيانات المراد حذفها.',
        example: 1
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'تم حذف الملف والسجل بنجاح.',
        schema: {
            example: {
                message: 'تم حذف الصورة بالمعرف 1 وملفها my-file.jpg بنجاح.'
            }
        }
    })
    @ApiNotFoundResponse({ description: 'لم يتم العثور على سجل الصورة.' })
    @ApiBadRequestResponse({ description: 'فشل في حذف الملف من Cloudinary أو خطأ غير متوقع.' })
    public async deleteUploadedImage(@Param('id') id: number) {
        const imageRecord = await this.imageService.findImageById(id);
        if (!imageRecord) {
            throw new NotFoundException(`سجل الصورة بالمعرف ${id} لم يتم العثور عليه في قاعدة البيانات.`);
        }

        const publicId = imageRecord.filename; // public_id في Cloudinary

        try {
            await cloudinary.uploader.destroy(publicId); // حذف من Cloudinary
            console.log(`Image with public ID ${publicId} deleted from Cloudinary.`);
        } catch (error) {
            console.error(`فشل في حذف الملف '${publicId}' من Cloudinary:`, error);
            throw new BadRequestException(`فشل في حذف الملف '${publicId}' من Cloudinary.`);
        }

        await this.imageService.deleteImageRecord(id); // حذف من قاعدة البيانات
        console.log(`تم حذف سجل الصورة بالمعرف ${id} بنجاح من قاعدة البيانات.`);

        return { message: `تم حذف الصورة بالمعرف ${id} وملفها '${publicId}' بنجاح.` };
    }

    // DELETE: ~/api/uploads/image/:imageId (حذف صورة من جدول Image مباشرة)
    // هذا Endpoint سيتصرف بنفس الطريقة الآن بعد التغييرات
    @Delete('image/:imageId')
    @ApiOperation({ summary: 'حذف صورة محددة بواسطة معرفها (ID) من جدول الصور وحذف الملف من Cloudinary.' })
    @ApiParam({
        name: 'imageId',
        type: Number,
        description: 'المعرف (ID) الخاص بالصورة في جدول الصور المراد حذفها.',
        example: 1
    })
    @ApiResponse({ status: HttpStatus.OK, description: 'تم حذف الصورة وملفها بنجاح.' })
    @ApiNotFoundResponse({ description: 'لم يتم العثور على الصورة في قاعدة البيانات.' })
    @ApiBadRequestResponse({ description: 'فشل في حذف الملف من Cloudinary أو خطأ غير متوقع.' })
    public async deleteImageDirectly(@Param('imageId', ParseIntPipe) imageId: number) {
        const imageRecord = await this.imageService.findImageById(imageId);
        if (!imageRecord) {
            throw new NotFoundException(`الصورة بالمعرف ${imageId} لم يتم العثور عليها في قاعدة البيانات.`);
        }

        const publicId = imageRecord.filename; // نفترض أن filename هو الـ public_id

        try {
            await cloudinary.uploader.destroy(publicId);
            console.log(`Image with public ID ${publicId} deleted from Cloudinary.`);
        } catch (error) {
            console.error(`فشل في حذف الملف '${publicId}' من Cloudinary:`, error);
            throw new BadRequestException(`فشل في حذف الملف '${publicId}' من Cloudinary.`);
        }

        await this.imageService.deleteImageRecord(imageId);
        console.log(`تم حذف سجل الصورة بالمعرف ${imageId} بنجاح من قاعدة البيانات.`);

        return { message: `تم حذف الصورة بالمعرف ${imageId} وملفها '${publicId}' بنجاح.` };
    }
}
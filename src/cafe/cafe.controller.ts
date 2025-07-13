/* eslint-disable prettier/prettier */

import { Body, Controller,Delete,Get,HttpCode,HttpStatus,Param,ParseIntPipe,Post, Put, Query, UploadedFiles, UseInterceptors
} from "@nestjs/common";

import{CafeService} from "./cafe.service";
//import { ConfigService } from "@nestjs/config";
import { CreateCafe } from "./dto/create-cafe.dto";
import { UpdateCafe } from "./dto/update-cafe.dto";
import { storage } from '../utils/cloudinary.storageCafe';
import { FilesInterceptor } from "@nestjs/platform-express/multer/interceptors/files.interceptor";

@Controller('api/cafe')
 export class CafesController{
    constructor(
        private readonly CafesService:CafeService,
    ){
        this.CafesService=CafesService;
    }
   
@Post('/')
  @UseInterceptors( 
    FilesInterceptor('files', 11, { storage }))
   @HttpCode(HttpStatus.CREATED)
    public addCafe(
      @Body() CreateCafe:CreateCafe, 
      @UploadedFiles() files: Express.Multer.File[],
    ){
        if (files && files.length>0) {
      CreateCafe.mainImageUrl = files[0].path; // رابط الصورة من Cloudinary
    }
            const galleryUrls: string[] = [];
        // const galleryUrls = galleryImages?.map(file => file.path) || [];
            if (files.length > 1) {
                for (let i = 1; i < files.length; i++) {
                    galleryUrls.push(files[i].path);
                }
            }
        return this.CafesService.addcafe(CreateCafe,galleryUrls);
    }

    
 @Get("/")
getAllCafes(
  @Query('name') name?: string,
  @Query('type') type?: string,
  @Query('location') location?: string,
) {
  return this.CafesService.getAllCafes({ name, type, location });
}


@Get("/:id")
    public getcafeById(@Param("id",ParseIntPipe) id:number){
        return this.CafesService.getOneById(id);
    }
  
@Put('/:id')
@UseInterceptors(FilesInterceptor('files', 11, { storage }))
@HttpCode(HttpStatus.OK)
public updateCafe(
  @Param('id') id: number,
  @Body() updateCafeDto: UpdateCafe,
  @UploadedFiles() files: Express.Multer.File[],
) {
  let mainImageUrl: string | undefined;
  const galleryUrls: string[] = [];

  if (files && files.length > 0) {
    mainImageUrl = files[0].path;
    if (files.length > 1) {
      for (let i = 1; i < files.length; i++) {
        galleryUrls.push(files[i].path);
      }
    }
  }
  return this.CafesService.updateCafe(id, updateCafeDto, mainImageUrl, galleryUrls);
}

//**add image to gallery and delete
@Post(':id/gallery')
@UseInterceptors(FilesInterceptor('galleryImages', 10, { storage }))
@HttpCode(HttpStatus.OK)
async updateCafeGallery(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFiles() files: Express.Multer.File[],
) {
  const galleryUrls = files.map((file) => file.path);
  return this.CafesService.updateCafeGallery(id, galleryUrls);
}

//**add image to gallery
@Post(':id/gallery/add')
@UseInterceptors(FilesInterceptor('galleryImages', 10, { storage }))
@HttpCode(HttpStatus.OK)
async addToCafeGallery(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFiles() files: Express.Multer.File[],
) {
  const galleryUrls = files.map((file) => file.path);
  return this.CafesService.addToGallery(id, galleryUrls);
}


     @Delete("/:id")
    public deleteProduct(@Param("id") id:number){
        return this.CafesService.delete(id);
    }

}


/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { 
 //   NotFoundException,
    Injectable, 
    NotFoundException,
    } from "@nestjs/common";

import {  ILike, Repository } from "typeorm";
import { Cafe } from "./cafe.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateCafe } from "./dto/create-cafe.dto";
import { UpdateCafe } from "./dto/update-cafe.dto";
import { type } from "src/utils/enums";
import { CafeImage } from '../cafe/gallary.entity'; // أو حسب المسار عندك

@Injectable()
export class CafeService{
    productsRepository: any;
constructor(
    @InjectRepository(Cafe)
    private readonly cafesRepository:Repository<Cafe>, 
    @InjectRepository(CafeImage)
    private readonly imageRepository: Repository<CafeImage>,
){
}

     public async addcafe(dto: CreateCafe,galleryUrls: string[]) {
    //     const newCafe = this.cafesRepository.create({
    //         ...dto,
    //         galleryImages: imagesurls.map(url => this.cafesRepository.create({ imageUrl: url })),
    //     });
    // return this.cafesRepository.save(newCafe);
    const newCafe = this.cafesRepository.create(dto);
    const savedCafe = await this.cafesRepository.save(newCafe);
    if (galleryUrls && galleryUrls.length > 0) {
            const galleryImages = galleryUrls.map((url) =>
                this.imageRepository.create({ url: url, cafe: savedCafe }) // ربط الصورة بالكافيه المحفوظ
            );
            await this.imageRepository.save(galleryImages); // حفظ صور المعرض
        }
        return savedCafe;
    }

    public async getAllCafes(filter?: {
  name?: string;
  type?: type|string;
  location?: string;
}) {
  const where: any = {};

  if (filter?.name) {
    where.name = ILike(`%${filter.name}%`);
  }

  if (filter?.type) {
    where.type = filter.type;
  }

  if (filter?.location) {
    where.location = ILike(`%${filter.location}%`);
  }

  return this.cafesRepository.find({ where });
}


     public async getOneById(id:number){
        const cafe=await this.cafesRepository.findOne({where:{id}});
        if(!cafe) throw new NotFoundException( );
        return cafe;
    }

public async updateCafe(
  id: number,
  dto: UpdateCafe,
  mainImageUrl?: string,
  galleryUrls?: string[],
) {
  const cafe = await this.cafesRepository.findOne({ where: { id } });
  if (!cafe) throw new NotFoundException('Cafe not found');

  // تحديث الحقول مع الحفاظ على القيم السابقة إذا لم تُرسل
  cafe.name = dto.name ?? cafe.name;
  cafe.description = dto.description ?? cafe.description;
  cafe.rating = dto.rating ?? cafe.rating;
  cafe.type = dto.type ?? cafe.type;
  cafe.openingTime = dto.openingTime ?? cafe.openingTime;
  cafe.closingTime = dto.closingTime ?? cafe.closingTime;

  // تحديث الصورة الرئيسية
  if (mainImageUrl) {
    cafe.mainImageUrl = mainImageUrl;
  }

  await this.cafesRepository.save(cafe);

  if (galleryUrls && galleryUrls.length > 0) {
    await this.imageRepository.delete({ cafe: { id } });

    const galleryImages = galleryUrls.map((url) =>
      this.imageRepository.create({ url, cafe })
    );
    await this.imageRepository.save(galleryImages);
  }

  return cafe;
}

//**add image to gallery and delete 
async updateCafeGallery(id: number, galleryUrls: string[]) {
  const cafe = await this.cafesRepository.findOne({ where: { id } });
  if (!cafe) throw new NotFoundException('Cafe not found');

  // حذف الصور القديمة
  await this.imageRepository.delete({ cafe: { id } });

  // إضافة الصور الجديدة
  const galleryImages = galleryUrls.map((url) =>
    this.imageRepository.create({ url, cafe })
  );
  await this.imageRepository.save(galleryImages);

  return {
    message: 'Gallery updated successfully',
    gallery: galleryUrls,
  };
}
//** add image to gallery
async addToGallery(id: number, galleryUrls: string[]) {
  const cafe = await this.cafesRepository.findOne({ where: { id } });
  if (!cafe) throw new NotFoundException('Cafe not found');

  const newImages = galleryUrls.map((url) =>
    this.imageRepository.create({ url, cafe })
  );

  await this.imageRepository.save(newImages);

  return {
    message: 'Images added to gallery successfully',
    newImages: galleryUrls,
  };
}


    public async delete( id:number){
        const cafe=await this.getOneById(id)
        await this.cafesRepository.remove(cafe)
        return {message:'cafe deleted successfully'}
    }

}
    
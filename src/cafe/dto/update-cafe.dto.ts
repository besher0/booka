/* eslint-disable prettier/prettier */
import {IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, Max, Min} from 'class-validator'
import { type } from 'src/utils/enums';

export class UpdateCafe{
    @IsString()
    @IsNotEmpty()
    name?:string
    
    @IsString()
    @IsNotEmpty()
    description?:string
    
      @IsString()
      @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'صيغة الوقت يجب أن تكون HH:MM' })
      openingTime: string;
    
      @IsString()
      @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'صيغة الوقت يجب أن تكون HH:MM' })
      closingTime: string;

         @IsEnum(type)
          @IsNotEmpty()
          type: type;

    @Min(0)
    @Max(5)
    rating?:number

      @IsOptional()
      @IsUrl()
      mainImage?: string;
    
      @IsOptional()
      @IsUrl()
      images?: string[];
}
/* eslint-disable prettier/prettier */
import {IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, Max, Min} from 'class-validator'
import { type } from 'src/utils/enum/enums';
export class CreateCafe{
    @IsString()
    @IsNotEmpty()
    name:string
    
    @IsEnum(type)
    @IsNotEmpty()
    type: type;

      @IsOptional()
      @IsUrl()
      mainImageUrl?: string;
    

    @IsString()
    @IsNotEmpty()
    description:string
    
    @IsString()
    @IsNotEmpty()
    location:string

    @Min(0)
    @Max(5)
    rating:number

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'صيغة الوقت يجب أن تكون HH:MM' })
  openingTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'صيغة الوقت يجب أن تكون HH:MM' })
  closingTime: string;
}
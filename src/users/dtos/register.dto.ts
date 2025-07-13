/* eslint-disable prettier/prettier */
import {  IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from "class-validator";
import { Gender } from "src/utils/enums";

export class RegisterDto {
    @IsString()
    @MaxLength(250)
    @Length(10 ,10)
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsString()
    @Length(2, 150)
    username: string;

     @IsEnum(Gender, { message: 'يجب أن تكون القيمة male أو female فقط' })
  gender: Gender;
}
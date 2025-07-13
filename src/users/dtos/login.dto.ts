/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @IsEmail()
    @MaxLength(250)
    @IsNotEmpty()
    phoneNumber: string;

    

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;
}
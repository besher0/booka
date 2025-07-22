/* eslint-disable prettier/prettier */
import {  IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger"; // **استيراد Swagger**

export class LoginDto {
    @ApiProperty({
        example: '1000000000', // أو رقم هاتف إذا كان هو المستخدم للـ login
        description: 'البريد الإلكتروني أو رقم هاتف المستخدم',
        type: String,
        maxLength: 250,
    })
    @IsString()
    @MaxLength(250)
    @IsNotEmpty()
    phoneNumber: number; // أو email

    @ApiProperty({
        example: 'strongpassword123',
        description: 'كلمة مرور المستخدم',
        type: String,
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;
}
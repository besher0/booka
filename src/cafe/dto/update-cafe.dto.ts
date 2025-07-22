/* eslint-disable prettier/prettier */
import {IsEnum, IsNotEmpty, IsOptional, IsString, Matches} from 'class-validator'
import { type } from 'src/utils/enum/enums'; // تأكد من المسار
import { ApiProperty, PartialType } from '@nestjs/swagger'; // **استيرادات Swagger جديدة**
import { CreateCafe } from './create-cafe.dto';

export class UpdateCafe extends PartialType(CreateCafe) { // PartialType من CreateCafe وليس من Swagger
    @ApiProperty({
        example: 'كافيه الوردة',
        description: 'اسم الكافيه المحدث',
        required: false,
        type: String,
        maxLength: 150,
    })
    @IsOptional() // يجب أن تكون اختيارية في التحديث
    @IsString()
    @IsNotEmpty() // IsNotEmpty لا يزال يطبق إذا كان الحقل موجوداً
    name?:string; // جعلها اختيارية في التحديث
    
    @ApiProperty({
        example: 'كافيه مميز بأجوائه الجديدة والخدمة المطورة',
        description: 'وصف محدث للكافيه',
        required: false,
        type: String,
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?:string; // جعلها اختيارية في التحديث
    
    @ApiProperty({
        example: '09:00',
        description: 'وقت فتح الكافيه المحدث بصيغة HH:MM',
        required: false,
        type: String,
        pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    })
    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'صيغة الوقت يجب أن تكون HH:MM' })
    openingTime?: string; // جعلها اختيارية في التحديث

    @ApiProperty({
        example: '22:00',
        description: 'وقت إغلاق الكافيه المحدث بصيغة HH:MM',
        required: false,
        type: String,
        pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    })
    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'صيغة الوقت يجب أن تكون HH:MM' })
    closingTime?: string; // جعلها اختيارية في التحديث

    @ApiProperty({
        example: 'sport',
        description: 'نوع الكافيه المحدث',
        enum: type,
        required: false,
    })
    @IsOptional()
    @IsEnum(type)
    @IsNotEmpty() // IsNotEmpty لا يزال يطبق إذا كان الحقل موجوداً
    type?: type; // جعلها اختيارية في التحديث


}
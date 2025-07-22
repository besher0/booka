/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
// src/cafe/dto/create-cafe.dto.ts
import {IsEnum, IsNotEmpty, IsString, Matches, } from 'class-validator'
import { type } from 'src/utils/enum/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCafe{
    @ApiProperty({
        example: 'كافيه موغامبو',
        description: 'اسم الكافيه الفريد',
        type: String,
        maxLength: 150,
    })
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @ApiProperty({
        example: 'public',
        description: 'نوع الكافيه (مثلاً: رياضي، عام، دراسي، سياحي)',
        enum: type,
    })
    @IsEnum(type)
    @IsNotEmpty()
    type: type;

    @ApiProperty({
        example: 'كافيه مميز بأجوائه الهادئة ومشروباته اللذيذة',
        description: 'وصف مفصل للكافيه',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    description: string;
    
    @ApiProperty({
        example: 'دمشق، المالكي، شارع فايز منصور',
        description: 'الموقع الجغرافي أو العنوان الوصفي للكافيه',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({
        example: '08:00',
        description: 'وقت فتح الكافيه بصيغة HH:MM (نظام 24 ساعة)',
        type: String,
        pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'صيغة الوقت يجب أن تكون HH:MM' })
    openingTime: string;

    @ApiProperty({
        example: '23:00',
        description: 'وقت إغلاق الكافيه بصيغة HH:MM (نظام 24 ساعة)',
        type: String,
        pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'صيغة الوقت يجب أن تكون HH:MM' })
    closingTime: string;

    @ApiProperty({ // <--- تم إضافة هذا الحقل
        example: 'ABCDEF12',
        description: 'كود مسؤول لتصريح إنشاء الكافيه',
        type: String,
        maxLength: 20,
    })
    @IsString()
    @IsNotEmpty()
    adminCode: string; // <--- تم إضافة هذا الحقل
}
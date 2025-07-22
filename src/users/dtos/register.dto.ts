/* eslint-disable prettier/prettier */
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from "class-validator";
import { Gender } from "src/utils/enum/enums"; // تأكد من المسار
import { ApiProperty } from "@nestjs/swagger"; // **استيراد Swagger**

export class RegisterDto {
    @ApiProperty({
        example: '0964634015', // مثال لرقم هاتف في سوريا
        description: 'رقم هاتف المستخدم (10 أرقام)',
        type: String,
        minLength: 10,
        maxLength: 10,
    })
    @IsString()
    @MaxLength(250) // قد تحتاج لتعديل هذا لـ 10 إذا كان رقم هاتف فقط
    @Length(10 ,10) // للتأكد من أنه 10 أرقام
    @IsNotEmpty()
    phoneNumber: number;

    @ApiProperty({
        example: 'strongpassword123',
        description: 'كلمة مرور المستخدم (6 أحرف على الأقل)',
        type: String,
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        example: 'علي أحمد',
        description: 'اسم المستخدم (اختياري)',
        required: false,
        type: String,
        minLength: 2,
        maxLength: 150,
    })
    @IsOptional()
    @IsString()
    @Length(2, 150)
    username: string;

    @ApiProperty({
        example: 'ذكر',
        description: 'جنس المستخدم',
        enum: Gender,
    })
    @IsEnum(Gender, { message: 'يجب أن تكون القيمة ذكر أو أنثى فقط' })
    gender: Gender;
}
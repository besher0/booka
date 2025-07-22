/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsOptional, IsString, Length, MinLength } from "class-validator";
import { ApiProperty, } from "@nestjs/swagger"; // **استيراد Swagger**

export class UpdateUserDto {
    @ApiProperty({
        example: 'newStrongPassword123',
        description: 'كلمة المرور الجديدة للمستخدم (يجب أن تكون 6 أحرف على الأقل)',
        required: false,
        type: String,
        minLength: 6,
    })
    @IsOptional()
    @IsString()
    @MinLength(6)
    @IsNotEmpty() // IsNotEmpty لا يزال يطبق إذا كان الحقل موجوداً
    password?: string;

    @ApiProperty({
        example: 'مستخدم جديد',
        description: 'اسم المستخدم الجديد',
        required: false,
        type: String,
        minLength: 2,
        maxLength: 150,
    })
    @IsOptional()
    @IsString()
    @Length(2, 150)
    username?: string;
}
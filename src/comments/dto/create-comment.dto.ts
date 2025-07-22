/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, MinLength, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // **استيراد Swagger**

export class CreateCommentDto {
  @ApiProperty({
      example: 'خدمة رائعة وقهوة ممتازة!',
      description: 'محتوى التعليق',
      type: String,
      minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string; 

//   @ApiProperty({
//       example: 5,
//       description: 'تقييم الكافيه (من 1 إلى 5 نجوم)',
//       type: Number,
//       minimum: 1,
//       maximum: 5,
//   })
//   @IsNumber()
//   @IsNotEmpty()
//   @Min(1)
//   @Max(5) 
//   rating: number; 
  
  @ApiProperty({
      example: 1,
      description: 'معرف الكافيه المراد التعليق عليه',
      type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  cafeId: number; 

  @ApiProperty({
      example: 101,
      description: 'معرف المستخدم الذي قام بالتعليق (يتم استخلاصه من الـ JWT عادةً)',
      type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number; // ملاحظة: هذا الحقل لا ينبغي أن يرسله العميل إذا كان يُستخلص من الـ JWT
}
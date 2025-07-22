/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
import { IsOptional, IsNumber, Min, IsString, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // **استيراد Swagger**
import { DeliveryMethod } from '../../utils/enum/delivery-method.enum'; // تأكد من المسار النسبي الصحيح
// **PaymentMethod سيعرف هنا أو في Order Entity**
export enum PaymentMethod { // **إذا لم يكن لديك ملف enum لهذا، عرفه هنا**
  CASH = 'cash',
}

export class CreateOrderDto {
  @ApiProperty({
    example: 1,
    description: 'معرف الكافيه الذي سيتم الطلب منه',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  cafeId: number;

  @ApiProperty({
    example: 10.50,
    description: 'قيمة الخصم المطبقة على الطلب (اختياري)',
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({
    example: 0.10,
    description: 'قيمة الضريبة المضافة على الطلب (اختياري)',
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({
    example: 'طاولة',
    description: 'طريقة استلام الطلب (طاولة أو سفري)',
    enum: DeliveryMethod,
  })
  @IsEnum(DeliveryMethod)
  @IsNotEmpty()
  deliveryMethod: DeliveryMethod;

  @ApiProperty({
    example: 4,
    description: 'عدد الأشخاص المرتبطين بالطلب (مطلوب لطريقة طاولة، اختياري لغيرها)',
    required: false,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfPeople?: number;

  @ApiProperty({
    example: 'أرجو إضافة ثلج إضافي ومنديل',
    description: 'ملاحظات إضافية على الطلب',
    required: false,
    type: String,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiProperty({
    example: 'cash',
    description: 'طريقة الدفع (كاش فقط حالياً)',
    enum: PaymentMethod,
  })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'تفاصيل إضافية عن الدفع (اختياري، مثل تفاصيل البطاقة إذا تم توسيع طرق الدفع)',
    required: false,
    type: Object,
  })
  @IsOptional()
  paymentDetails?: any;
}
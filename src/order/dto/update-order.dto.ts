/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './dto.create.order'; // تأكد من المسار
import { IsOptional, IsString, IsNumber, IsEnum, Min, MaxLength } from 'class-validator';
import { OrderStatus } from '../../utils/enum/order-status.enum'; // تأكد من المسار
import { DeliveryMethod } from '../../utils/enum/delivery-method.enum'; // استيراد DeliveryMethod
import { PaymentMethod } from '../order.entity'; // استيراد PaymentMethod
import { ApiProperty } from '@nestjs/swagger'; // **استيراد Swagger**

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    example: 100.00,
    description: 'المبلغ الإجمالي المحدث قبل الخصم والضريبة',
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;

  @ApiProperty({
    example: 5.00,
    description: 'قيمة الخصم المحدثة',
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({
    example: 1.50,
    description: 'قيمة الضريبة المحدثة',
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmount?: number;

  @ApiProperty({
    example: 96.50,
    description: 'المبلغ النهائي المحدث بعد الخصم والضريبة',
    required: false,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  finalAmount?: number;

  @ApiProperty({
    example: 'قيد التحضير',
    description: 'الحالة الجديدة للطلب',
    enum: OrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    example: 'سفري',
    description: 'طريقة الاستلام المحدثة',
    enum: DeliveryMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(DeliveryMethod)
  deliveryMethod?: DeliveryMethod; // إضافة this to UpdateOrderDto

  @ApiProperty({
    example: 2,
    description: 'عدد الأشخاص المحدث',
    required: false,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfPeople?: number;

  @ApiProperty({
    example: 'ملاحظات محدثة على الطلب.',
    description: 'ملاحظات الطلب المحدثة',
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
    description: 'طريقة الدفع المحدثة',
    enum: PaymentMethod,
    required: false,
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiProperty({
    description: 'تفاصيل الدفع المحدثة (اختياري)',
    required: false,
    type: Object,
  })
  @IsOptional()
  paymentDetails?: any;
}
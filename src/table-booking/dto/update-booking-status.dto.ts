/* eslint-disable prettier/prettier */
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // **استيراد Swagger**
import { BookingStatus } from '../../utils/enum/booking-status.enum'; // تأكد من المسار

export class UpdateBookingStatusDto {
  @ApiProperty({
    example: 'مؤكد',
    description: 'الحالة الجديدة للحجز',
    enum: BookingStatus,
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @ApiProperty({
    example: 'لا يوجد طاولات متاحة في هذا الوقت.',
    description: 'سبب الرفض (مطلوب إذا كانت الحالة "مرفوض")',
    required: false,
    type: String,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
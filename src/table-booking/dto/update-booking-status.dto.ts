/* eslint-disable prettier/prettier */
// src/table-booking/dto/update-booking-status.dto.ts
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { BookingStatus } from '../../utils/enum/booking-status.enum'; // تأكد من المسار

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus; // الحالة الجديدة للحجز (مؤكد، مرفوض، ملغى)

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string; // سبب الرفض (مطلوب إذا كانت الحالة مرفوضة)
}
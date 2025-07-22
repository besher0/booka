/* eslint-disable prettier/prettier */
import { IsNumber, IsNotEmpty, IsString, IsDateString, IsOptional, Min, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'; // **استيراد Swagger**
import { SessionType } from '../../utils/enum/session-type.enum'; // تأكد من المسار

export class CreateTableBookingDto {
  @ApiProperty({
    example: 1,
    description: 'معرف الكافيه الذي سيتم الحجز فيه',
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  cafeId: number;

  @ApiProperty({
    example: '2025-08-15',
    description: 'تاريخ الحجز بصيغة YYYY-MM-DD',
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: '18:30',
    description: 'وقت الحجز بصيغة HH:MM (24 ساعة)',
    type: String,
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsString()
  @IsNotEmpty()
  time: string;

  @ApiProperty({
    example: 4,
    description: 'عدد الأشخاص للحجز',
    type: Number,
    minimum: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  numberOfPeople: number;

  @ApiProperty({
    example: 'داخلية',
    description: 'نوع الجلسة (داخلية أو خارجية)',
    enum: SessionType,
  })
  @IsEnum(SessionType)
  @IsNotEmpty()
  sessionType: SessionType;

  @ApiProperty({
    example: 'أرجو طاولة بجانب النافذة.',
    description: 'ملاحظات إضافية على الحجز (اختياري)',
    required: false,
    type: String,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
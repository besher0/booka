/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/mapped-types';
import { CreateTableBookingDto } from './create-table-booking.dto';
import { ApiProperty } from '@nestjs/swagger'; // **استيراد Swagger**
import { IsNumber, IsString, IsDateString, IsOptional, Min, MaxLength, IsEnum } from 'class-validator';
import { SessionType } from '../../utils/enum/session-type.enum'; // تأكد من المسار

export class UpdateTableBookingDto extends PartialType(CreateTableBookingDto) {
  @ApiProperty({
    example: 1,
    description: 'معرف الكافيه المراد تحديثه (لا يُغير عادةً)',
    required: false,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  cafeId?: number;

  @ApiProperty({
    example: '2025-08-20',
    description: 'تاريخ الحجز المحدث بصيغة YYYY-MM-DD',
    required: false,
    type: String,
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    example: '19:00',
    description: 'وقت الحجز المحدث بصيغة HH:MM',
    required: false,
    type: String,
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
  })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({
    example: 2,
    description: 'عدد الأشخاص المحدث للحجز',
    required: false,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfPeople?: number;

  @ApiProperty({
    example: 'خارجية',
    description: 'نوع الجلسة المحدث',
    enum: SessionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(SessionType)
  sessionType?: SessionType;

  @ApiProperty({
    example: 'ملاحظات محدثة: أريد تغيير عدد الأشخاص فقط.',
    description: 'ملاحظات إضافية محدثة على الحجز',
    required: false,
    type: String,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
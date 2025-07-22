/* eslint-disable prettier/prettier */
// src/table-booking/dto/create-table-booking.dto.ts
import { IsNumber, IsNotEmpty, IsString, IsDateString, IsOptional, Min, MaxLength, IsEnum } from 'class-validator';
import { SessionType } from '../../utils/enum/session-type.enum'; // تأكد من المسار

export class CreateTableBookingDto {
  @IsNumber()
  @IsNotEmpty()
  cafeId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  numberOfPeople: number;

  @IsEnum(SessionType)
  @IsNotEmpty()
  sessionType: SessionType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
/* eslint-disable prettier/prettier */
// src/table-booking/dto/update-table-booking.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTableBookingDto } from './create-table-booking.dto';

export class UpdateTableBookingDto extends PartialType(CreateTableBookingDto) {}
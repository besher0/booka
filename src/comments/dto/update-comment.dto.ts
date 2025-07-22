/* eslint-disable prettier/prettier */
import { PartialType } from '@nestjs/swagger'; // PartialType من Swagger أو @nestjs/mapped-types
import { CreateCommentDto } from './create-comment.dto';
import { ApiProperty } from '@nestjs/swagger'; // **استيراد Swagger**
import { IsString, IsOptional, MinLength } from 'class-validator'; // استيرادات للتوضيح

export class UpdateCommentDto extends PartialType(CreateCommentDto) {
  @ApiProperty({
      example: 'خدمة سريعة جداً!',
      description: 'محتوى التعليق المحدث',
      required: false,
      type: String,
      minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  content?: string;}
/* eslint-disable prettier/prettier */
// src/comment/dto/create-comment.dto.ts
import { IsString, IsNotEmpty, MinLength, IsNumber, Min, Max } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  content: string; 

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5) 
  rating: number; 
  @IsNumber()
  @IsNotEmpty()
  cafeId: number; 

    @IsNumber()
  @IsNotEmpty()
  userId: number; 
}
/* eslint-disable prettier/prettier */
// src/love/love.controller.ts
import { Controller, Post, Body, Param, Get, UseGuards, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { LoveService } from './love.service';
import { CreateLoveDto } from './dto/create-love.dto';

// **استيراد الجارد والديكورات الصحيحة**
import { AuthGuard } from '../users/guards/auth.guard'; // تأكد من المسار الصحيح
import { CurrentUser } from '../users/decorators/current-user.decorator'; // تأكد من المسار الصحيح إذا كان هذا هو GetUser لديك
import { User } from '../users/user.entity';

// **استيراد ToggleLoveResponse من المسار الجديد**
import { ToggleLoveResponse } from '../utils/toggle-love-response.interface'; // تأكد من المسار

@Controller('api/loves')
export class LoveController {
  constructor(private readonly loveService: LoveService) {}

  @UseGuards(AuthGuard)
  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  async toggleLove(
    @CurrentUser() user: User, // **استخدم @CurrentUser أو @GetUser الصحيح**
    @Body() toggleLoveDto: CreateLoveDto,
  ): Promise<ToggleLoveResponse> { // **أضف نوع الإرجاع هنا**
    return this.loveService.toggleLove(user.id, toggleLoveDto);
  }

  @Get()
  findAll() {
    return this.loveService.findAll();
  }

  @Get('user/:userId')
  findLovesByUser(@Param('userId') userId: string) {
    return this.loveService.findLovesByUser(+userId);
  }

  // @Get('cafe/:cafeId')
  // findLovesByCafe(@Param('cafeId') cafeId: string) {
  //   return this.loveService.findLovesByCafe(+cafeId);
  // }

  // @Get('product/:productId')
  // findLovesByProduct(@Param('productId') productId: string) {
  //   return this.loveService.findLovesByProduct(+productId);
  // }

//   @Get('comment/:commentId')
//   findLovesByComment(@Param('commentId') commentId: string) {
//     return this.loveService.findLovesByComment(+commentId);
//   }

  @UseGuards(AuthGuard)
  @Get('is-loved')
  isLovedByUser(
    @CurrentUser() user: User, // **استخدم @CurrentUser أو @GetUser الصحيح**
    @Query() checkLoveDto: CreateLoveDto,
  ) {
    return this.loveService.isLovedByUser(user.id, checkLoveDto);
  }
}


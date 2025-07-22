/* eslint-disable prettier/prettier */
// src/love/love.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { LoveService } from './love.service';
import { CreateLoveDto } from './dto/create-love.dto';

import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ToggleLoveResponse } from '../utils/toggle-love-response.interface';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Love')
@Controller('api/loves')
export class LoveController {
  constructor(private readonly loveService: LoveService) {}

  @UseGuards(AuthGuard)
  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toggle love (like/unlike) for a product, comment, or cafe' })
  @ApiBody({ type: CreateLoveDto })
    @ApiBearerAuth("access-token")
  @ApiResponse({ status: 200, description: 'Love toggled successfully', type: Object })
  async toggleLove(
    @CurrentUser() user: User,
    @Body() toggleLoveDto: CreateLoveDto,
  ): Promise<ToggleLoveResponse> {
    return this.loveService.toggleLove(user.id, toggleLoveDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all love records' })
  @ApiResponse({ status: 200, description: 'All love records returned' })
  findAll() {
    return this.loveService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get loves by user ID' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Loves by user returned' })
  findLovesByUser(@Param('userId') userId: string) {
    return this.loveService.findLovesByUser(+userId);
  }

  @UseGuards(AuthGuard)
  @Get('is-loved')
  @ApiOperation({ summary: 'Check if a user has loved a product, comment, or cafe' })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'cafeId', required: false, type: Number })
  @ApiQuery({ name: 'commentId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Love status returned' })
  isLovedByUser(
    @CurrentUser() user: User,
    @Query() checkLoveDto: CreateLoveDto,
  ) {
    return this.loveService.isLovedByUser(user.id, checkLoveDto);
  }
}

/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, Delete, UseGuards, HttpCode, HttpStatus, ForbiddenException, Put } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ParseIntPipe } from '@nestjs/common';
import { UserType } from 'src/utils/enum/enums';

// Swagger imports
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Ratings')
@ApiBearerAuth()
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(AuthGuard)
  @Post()
          @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new rating' })
  @ApiResponse({ status: 201, description: 'Rating successfully created.' })
  @ApiResponse({ status: 403, description: 'Admin users are not allowed to create ratings.' })
  @ApiBody({ type: CreateRatingDto })
  async create(
    @CurrentUser() user: User,
    @Body() createRatingDto: CreateRatingDto,
  ) {    
    if (user.userType === UserType.ADMIN) {
      throw new ForbiddenException('Admin users are not allowed to create ratings.');
    }
    return this.ratingService.create(user.id, createRatingDto);
  }

  @UseGuards(AuthGuard)
  @Get('/')
          @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get all ratings (admin only)' })
  @ApiResponse({ status: 200, description: 'List of all ratings.' })
  @ApiResponse({ status: 403, description: 'Only administrators can view all ratings.' })
  async findAll(@CurrentUser() user: User) {
    if (user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only administrators can view all ratings.');
    }
    return this.ratingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rating by ID' })
  @ApiResponse({ status: 200, description: 'Rating found.' })
  @ApiResponse({ status: 404, description: 'Rating not found.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the rating' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ratingService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
          @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Update a rating by ID' })
  @ApiResponse({ status: 200, description: 'Rating successfully updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden to update this rating.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the rating to update' })
  @ApiBody({ type: UpdateRatingDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRatingDto: UpdateRatingDto,
    @CurrentUser() user: User,
  ) {
    return this.ratingService.update(id, user.id, updateRatingDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
          @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a rating by ID' })
  @ApiResponse({ status: 200, description: 'Rating successfully deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden to delete this rating.' })
  @ApiParam({ name: 'id', type: Number, description: 'ID of the rating to delete' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.ratingService.remove(id, user.id);
  }

  @Get('cafe/:cafeId')
  @ApiOperation({ summary: 'Get all ratings for a specific cafe' })
  @ApiResponse({ status: 200, description: 'List of ratings for the cafe.' })
  @ApiParam({ name: 'cafeId', type: Number, description: 'ID of the cafe' })
  findRatingsByCafe(@Param('cafeId', ParseIntPipe) cafeId: number) {
    return this.ratingService.findRatingsByCafe(cafeId);
  }

  @UseGuards(AuthGuard)
  @Get('user/:userId')
          @ApiBearerAuth("access-token")
  @ApiOperation({ summary: 'Get all ratings by a specific user (admin or owner only)' })
  @ApiResponse({ status: 200, description: 'List of ratings by the user.' })
  @ApiResponse({ status: 403, description: 'Not authorized to view these ratings.' })
  @ApiParam({ name: 'userId', type: Number, description: 'ID of the user' })
  async findRatingsByUser(@Param('userId', ParseIntPipe) userId: number, @CurrentUser() user: User) {
    if (user.id !== userId && user.userType !== UserType.ADMIN) {
      throw new ForbiddenException('You are not authorized to view these ratings.');
    }
    return this.ratingService.findRatingsByUser(userId);
  }
}

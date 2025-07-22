/* eslint-disable prettier/prettier */
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Put
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

import { AuthGuard } from '../users/guards/auth.guard';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { JWTPayloadType } from 'src/utils/types';

@ApiTags('Comments')
@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create a new comment (requires authentication)' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateCommentDto })
  create(@CurrentUser() user: User, @Body() createCommentDto: CreateCommentDto) {
    return this.commentsService.create(user.id, createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments' })
  @ApiResponse({ status: 200, description: 'List of all comments returned' })
  findAll() {
    return this.commentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single comment by ID' })
  @ApiResponse({ status: 200, description: 'Comment returned successfully' })
  @ApiResponse({ status: 404, description: 'Comment not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Comment ID' })
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

@Put(':id')
@ApiOperation({ summary: 'Update a comment by ID' })
@ApiResponse({ status: 200, description: 'Comment updated successfully' })
@ApiParam({ name: 'id', type: Number })
@ApiBody({ type: UpdateCommentDto })
@UseGuards(AuthGuard) // تأكد من وجود الحارس
@ApiBearerAuth("access-token")
async update(
  @Param('id') id: string,
  @Body() updateCommentDto: UpdateCommentDto,
  @CurrentUser() user: JWTPayloadType // احصل على المستخدم من التوكين
) {
  return this.commentsService.update(+id, updateCommentDto, user.id);
}

@Delete(':id')
@ApiOperation({ summary: 'Delete a comment by ID' })
@ApiResponse({ status: 200, description: 'Comment deleted successfully' })
@ApiParam({ name: 'id', type: Number })
@UseGuards(AuthGuard)
@ApiBearerAuth("access-token")
async remove(
  @Param('id') id: string,
  @CurrentUser() user: JWTPayloadType
) {
  return this.commentsService.remove(+id, user.id);
}

}

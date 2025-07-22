/* eslint-disable prettier/prettier */
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cafe } from 'src/cafe/cafe.entity';
import { User } from 'src/users/user.entity';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Cafe)
    private readonly cafesRepository: Repository<Cafe>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(userId: number, createCommentDto: CreateCommentDto): Promise<Comment> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const cafe = await this.cafesRepository.findOne({ where: { id: createCommentDto.cafeId } });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${createCommentDto.cafeId} not found.`);
    }

    const newComment = this.commentRepository.create({
      content: createCommentDto.content,
      user,
      cafe,
    });

    return this.commentRepository.save(newComment);
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find({ relations: ['user', 'cafe'] });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'cafe'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found.`);
    }

    return comment;
  }

async update(id: number, updateCommentDto: UpdateCommentDto, userId: number): Promise<Comment> {
  const comment = await this.findOne(id);

  // التحقق من أن المستخدم هو صاحب التعليق
  if (comment.user.id !== userId) {
    throw new ForbiddenException('You can only edit your own comments');
  }

  if (updateCommentDto.content !== undefined) {
    comment.content = updateCommentDto.content;
  }

  return this.commentRepository.save(comment);
}

async remove(id: number, userId: number): Promise<object> {
  const comment = await this.findOne(id);

  // التحقق من أن المستخدم هو صاحب التعليق
  if (comment.user.id !== userId) {
    throw new ForbiddenException('You can only delete your own comments');
  }

  const result = await this.commentRepository.delete(id);

  if (result.affected === 0) {
    throw new NotFoundException(`Comment with ID ${id} not found.`);
  }
  return {messaging:"comment has been deleted"}
}


  // async findCommentsByUser(userId: number): Promise<Comment[]> {
  //   const user = await this.usersRepository.findOne({ where: { id: userId } });

  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${userId} not found.`);
  //   }

  //   return this.commentRepository.find({
  //     where: { user: { id: userId } },
  //     relations: ['user', 'cafe'],
  //     order: { createdAt: 'DESC' },
  //   });
  // }

  // async findCommentsByCafe(cafeId: number): Promise<Comment[]> {
  //   const cafe = await this.cafesRepository.findOne({ where: { id: cafeId } });

  //   if (!cafe) {
  //     throw new NotFoundException(`Cafe with ID ${cafeId} not found.`);
  //   }

  //   return this.commentRepository.find({
  //     where: { cafe: { id: cafeId } },
  //     relations: ['user', 'cafe'],
  //     order: { createdAt: 'DESC' },
  //   });
  // }
}

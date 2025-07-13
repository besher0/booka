/* eslint-disable prettier/prettier */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Repository } from 'typeorm';
import { Cafe } from 'src/cafe/cafe.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthProvider } from 'src/users/auth.providers';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { CafeService } from 'src/cafe/cafe.service';
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
   
  ){
  }
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
      rating: createCommentDto.rating, // أضف حقل التقييم هنا
      user: user,
      cafe: cafe,
    });
    return this.commentRepository.save(newComment);
  }
  save(newComment: Promise<Comment>): Comment | PromiseLike<Comment> {
    throw new Error('Method not implemented.');
  }

  async findAll(): Promise<Comment[]> {
    return this.commentRepository.find({ relations: ['user', 'cafe'] });
  }

  // مثال على كيفية تنفيذ findOne بشكل صحيح:
  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({ where: { id }, relations: ['user', 'cafe'] });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found.`);
    }
    return comment;
  }

  // قم بتحديث بقية الدوال (update, remove, findCommentsByUser, findCommentsByCafe) بنفس الطريقة
  // لتستخدم this.commentRepository بدلاً من `commentsRepository`
  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    if (updateCommentDto.content) {
      comment.content = updateCommentDto.content;
    }
    if (updateCommentDto.rating !== undefined) {
      comment.rating = updateCommentDto.rating;
    }
    return this.commentRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const result = await this.commentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Comment with ID ${id} not found.`);
    }
  }

  // async findCommentsByUser(userId: number): Promise<Comment[]> {
  //   const user = await this.usersRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${userId} not found.`);
  //   }
  //   return this.commentRepository.find({
  //     where: { user: { id: userId } },
  //     relations: ['user', 'cafe'],
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
  //     order: { createdAt: 'ASC' }
  //   });
  // }


}

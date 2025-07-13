/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/love/love.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; // أضف FindManyOptions
import { Love } from './love.entity';
import { CreateLoveDto } from './dto/create-love.dto';
import { User } from '../users/user.entity';
import { Cafe } from '../cafe/cafe.entity';
import { Product } from '../products/product.entity'; // تأكد من أن المسار صحيح لـ products
import { Comment } from '../comments/comment.entity'; // تأكد من أن المسار صحيح لـ comments

// **استيراد ToggleLoveResponse من المسار الجديد**
import { ToggleLoveResponse } from '../utils/toggle-love-response.interface';


@Injectable()
export class LoveService {
  constructor(
    @InjectRepository(Love)
    private loveRepository: Repository<Love>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Cafe)
    private cafeRepository: Repository<Cafe>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async toggleLove(userId: number, createLoveDto: CreateLoveDto): Promise<ToggleLoveResponse> {
    const { cafeId, productId, commentId } = createLoveDto;

    const targetIds = [cafeId, productId, commentId].filter(id => id !== undefined);
    if (targetIds.length !== 1) {
      throw new BadRequestException('Exactly one of cafeId, productId, or commentId must be provided.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    let targetEntity: Cafe | Product | Comment | null = null;
    const findQuery: any = { user: { id: userId } };
    const createData: any = { user: user };

    if (cafeId) {
      targetEntity = await this.cafeRepository.findOne({ where: { id: cafeId } });
      if (!targetEntity) throw new NotFoundException(`Cafe with ID ${cafeId} not found.`);
      findQuery.cafe = { id: cafeId };
      createData.cafe = targetEntity;
    } else if (productId) {
      targetEntity = await this.productRepository.findOne({ where: { id: productId } });
      if (!targetEntity) throw new NotFoundException(`Product with ID ${productId} not found.`);
      findQuery.product = { id: productId };
      createData.product = targetEntity;
    } else if (commentId) {
      targetEntity = await this.commentRepository.findOne({ where: { id: commentId } });
      if (!targetEntity) throw new NotFoundException(`Comment with ID ${commentId} not found.`);
      findQuery.comment = { id: commentId };
      createData.comment = targetEntity;
    } else {
        throw new BadRequestException('No target entity ID provided.');
    }

    const existingLove = await this.loveRepository.findOne({ where: findQuery });

    if (existingLove) {
      await this.loveRepository.remove(existingLove);
      return { action: 'removed' };
    } else {
      const newLove = this.loveRepository.create(createData);
      const savedLove = await this.loveRepository.save(newLove);
      return { action: 'added', love: savedLove };
    }
  }

  // **تأكد أن الدوال التالية موجودة وغير معلقة تماماً كما في الشرح السابق:**

  async findAll(): Promise<Love[]> {
    return this.loveRepository.find({ relations: ['user', 'cafe', 'product', 'comment'] });
  }

  async findLovesByUser(userId: number): Promise<Love[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return this.loveRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'cafe', 'product', 'comment'],
    });
  }

  async findLovesByCafe(cafeId: number): Promise<Love[]> {
    const cafe = await this.cafeRepository.findOne({ where: { id: cafeId } });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${cafeId} not found.`);
    }
    return this.loveRepository.find({
      where: { cafe: { id: cafeId } },
      relations: ['user', 'cafe', 'product', 'comment'],
    });
  }

  async findLovesByProduct(productId: number): Promise<Love[]> {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found.`);
    }
    return this.loveRepository.find({
      where: { product: { id: productId } },
      relations: ['user', 'cafe', 'product', 'comment'],
    });
  }

//   async findLovesByComment(commentId: number): Promise<Love[]> {
//     const comment = await this.commentRepository.findOne({ where: { id: commentId } });
//     if (!comment) {
//       throw new NotFoundException(`Comment with ID ${commentId} not found.`);
//     }
//     return this.commentRepository.find({
//       where: { comment: { id: commentId } },
//       relations: ['user', 'cafe', 'product', 'comment'],
//     });
//   }

  async isLovedByUser(userId: number, checkLoveDto: CreateLoveDto): Promise<boolean> {
    const { cafeId, productId, commentId } = checkLoveDto;

    const targetIds = [cafeId, productId, commentId].filter(id => id !== undefined);
    if (targetIds.length !== 1) {
      throw new BadRequestException('Exactly one of cafeId, productId, or commentId must be provided to check love status.');
    }

    const query: any = { user: { id: userId } };

    if (cafeId) {
      query.cafe = { id: cafeId };
    } else if (productId) {
      query.product = { id: productId };
    } else if (commentId) {
      query.comment = { id: commentId };
    }

    const love = await this.loveRepository.findOne({ where: query });
    return !!love;
  }
}
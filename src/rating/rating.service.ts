/* eslint-disable prettier/prettier */
// src/rating/rating.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { User } from '../users/user.entity';
import { Cafe } from '../cafe/cafe.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Cafe)
    private cafeRepository: Repository<Cafe>,
  ) {}

  private async updateCafeAverageRating(cafeId: number): Promise<void> {
    const cafe = await this.cafeRepository.findOne({ where: { id: cafeId }, relations: ['ratings'] });
    if (cafe) {
      const allRatings = await this.ratingRepository.find({ where: { cafe: { id: cafe.id } } });
      const totalValue = allRatings.reduce((sum, rating) => sum + rating.value, 0);
      cafe.totalRatingsCount = allRatings.length;
      cafe.averageRating = allRatings.length > 0 ? totalValue / allRatings.length : 0.0;
      await this.cafeRepository.save(cafe);
    }
  }

   async findAll(): Promise<Rating[]> {
    return this.ratingRepository.find({ relations: ['user', 'cafe'] });
  }

  async create(userId: number, createRatingDto: CreateRatingDto): Promise<Rating> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const cafe = await this.cafeRepository.findOne({ where: { id: createRatingDto.cafeId } });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${createRatingDto.cafeId} not found.`);
    }

    const existingRating = await this.ratingRepository.findOne({
      where: { user: { id: userId }, cafe: { id: createRatingDto.cafeId } },
    });
    if (existingRating) {
      throw new ConflictException('User has already rated this cafe. Please update the existing rating.');
    }

    const newRating = this.ratingRepository.create({
      value: createRatingDto.value, // **تم حذف الإشارة إلى comment**
      user: user,
      cafe: cafe,
    });

    const savedRating = await this.ratingRepository.save(newRating);
    await this.updateCafeAverageRating(cafe.id);
    return savedRating;
  }

  async findOne(id: number): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({ where: { id }, relations: ['user', 'cafe'] });
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found.`);
    }
    return rating;
  }

  async update(id: number, userId: number, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({ where: { id }, relations: ['user', 'cafe'] });
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found.`);
    }
    if (rating.user.id !== userId) {
      throw new ForbiddenException('You are not authorized to update this rating.');
    }
    if (updateRatingDto.cafeId && updateRatingDto.cafeId !== rating.cafe.id) {
      console.log(rating.cafe.id)
            console.log(updateRatingDto.cafeId)
        throw new BadRequestException('Cannot change cafe for an existing rating.');
    }
    if (updateRatingDto.value !== undefined) {
      rating.value = updateRatingDto.value;
    }
    const updatedRating = await this.ratingRepository.save(rating);
    await this.updateCafeAverageRating(updatedRating.cafe.id);
    return updatedRating;
  }

  async remove(id: number, userId: number): Promise<{ message: string }> {
    const rating = await this.ratingRepository.findOne({ where: { id }, relations: ['user', 'cafe'] });
    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found.`);
    }
    if (rating.user.id !== userId) {
      throw new ForbiddenException('You are not authorized to delete this rating.');
    }

    const cafeId = rating.cafe.id;
    await this.ratingRepository.remove(rating);
    await this.updateCafeAverageRating(cafeId);
    return {message:"delete rating"}
  }

  async findRatingsByCafe(cafeId: number): Promise<Rating[]> {
    const cafe = await this.cafeRepository.findOne({ where: { id: cafeId } });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${cafeId} not found.`);
    }
    return this.ratingRepository.find({ where: { cafe: { id: cafeId } }, relations: ['user', 'cafe'] });
  }

  async findRatingsByUser(userId: number): Promise<Rating[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
    return this.ratingRepository.find({ where: { user: { id: userId } }, relations: ['user', 'cafe'] });
  }
}
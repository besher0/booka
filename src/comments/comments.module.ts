/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Cafe } from 'src/cafe/cafe.entity';
import { Comment } from './comment.entity';
import { UsersModule } from '../users/users.module'; 
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [   
     TypeOrmModule.forFeature([Comment, User, Cafe]),UsersModule,ConfigModule
],
  controllers: [CommentsController],
  providers: [CommentsService],
    exports: [CommentsService],

})
export class CommentsModule {}

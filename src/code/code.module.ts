/* eslint-disable prettier/prettier */
// src/admin-code/admin-code.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminCodeService } from './code.service';
import { AdminCodeController } from './code.controller';
import { AdminCode } from './code.entity';
import { UsersModule } from 'src/users/users.module';
// import { User } from '../users/user.entity'; // <--- حذف هذا الاستيراد
// import { UsersModule } from '../users/users.module'; // <--- حذف هذا الاستيراد

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminCode]), // <--- تم حذف User من هنا
    UsersModule, // <--- حذف هذا
  ],
  providers: [AdminCodeService],
  controllers: [AdminCodeController],
  exports: [AdminCodeService],
})
export class AdminCodeModule {}
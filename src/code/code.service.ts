/* eslint-disable prettier/prettier */
/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/admin-code/admin-code.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminCode } from './code.entity'; // <--- المسار يجب أن يكون './admin-code.entity'
// import { customAlphabet } from 'nanoid';

// const generateRandomString = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);

@Injectable()
export class AdminCodeService {
  constructor(
    @InjectRepository(AdminCode)
    private adminCodeRepository: Repository<AdminCode>,
  ) {}

  /**
   * توليد كود فريد جديد.
   * @param adminUserId معرف المسؤول الذي قام بالتوليد (يُستخدم للتحقق من الدور في Controller فقط).
   * @returns كيان AdminCode الذي تم إنشاؤه.
   * @throws BadRequestException إذا فشل في توليد كود فريد بعد عدة محاولات.
   */
 async generateUniqueCode(adminUserId: number): Promise<AdminCode> {
    // استخدام الاستيراد الديناميكي لـ nanoid
    const { customAlphabet } = await import('nanoid'); // <--- استيراد ديناميكي
    const generateRandomString = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8); // تعريف الدالة بعد الاستيراد

    let code: string = '';
    let isUnique = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (!isUnique && attempts < MAX_ATTEMPTS) {
      code = generateRandomString();
      const existingCode = await this.adminCodeRepository.findOne({ where: { code } });
      if (!existingCode) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new BadRequestException('فشل في توليد كود فريد بعد عدة محاولات. الرجاء المحاولة مرة أخرى.');
    }

    const newAdminCode = this.adminCodeRepository.create({
      code,
      isUsed: false,
    });

    return this.adminCodeRepository.save(newAdminCode);
  }

  /**
   * التحقق من كود وإعطاء إذن استخدامه.
   * @param code الكود المقدم من المستخدم.
   * @param submittingUserId معرف المستخدم الذي يقدم الكود (لم يعد يُستخدم للتحقق من التخصيص).
   * @returns كيان AdminCode بعد الاستخدام.
   * @throws NotFoundException إذا لم يتم العثور على الكود.
   * @throws BadRequestException إذا كان الكود مستخدماً بالفعل.
   */
  async validateAndUseCode(code: string, submittingUserId: number): Promise<AdminCode> {
    const adminCode = await this.adminCodeRepository.findOne({ where: { code } });

    if (!adminCode) {
      throw new NotFoundException(`كود المسؤول '${code}' لم يتم العثور عليه.`);
    }

    if (adminCode.isUsed) {
      throw new BadRequestException(`كود المسؤول '${code}' قد تم استخدامه بالفعل.`);
    }

    adminCode.isUsed = true;
    return this.adminCodeRepository.save(adminCode);
  }

  /**
   * البحث عن كود مسؤول.
   * @param code الكود المراد البحث عنه.
   * @returns كيان AdminCode أو null.
   */
  async findCode(code: string): Promise<AdminCode | null> {
    return this.adminCodeRepository.findOne({ where: { code } });
  }

  /**
   * جلب جميع الأكواد (للمسؤولين فقط).
   * @returns مصفوفة من AdminCode entities.
   */
  async getAllAdminCodes(): Promise<AdminCode[]> {
    return this.adminCodeRepository.find();
  }

  /**
   * لحفظ كيان AdminCode بعد تعديله (مثل وضع علامة على أنه مستخدم).
   * @param adminCode كيان AdminCode المراد حفظه.
   */
  async saveCode(adminCode: AdminCode): Promise<AdminCode> {
    return this.adminCodeRepository.save(adminCode);
  }
}
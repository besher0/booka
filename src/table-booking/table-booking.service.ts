/* eslint-disable prettier/prettier */
// src/table-booking/table-booking.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TableBooking } from './table-booking.entity';
import { CreateTableBookingDto } from './dto/create-table-booking.dto';
import { UpdateTableBookingDto } from './dto/update-table-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { User } from '../users/user.entity';
import { Cafe } from '../cafe/cafe.entity';
import { BookingStatus } from '../utils/enum/booking-status.enum';
import { UserType } from '../utils/enum/enums';
import { NotificationService } from '../notification/notification.service'; // تأكد من المسار

@Injectable()
export class TableBookingService {
  constructor(
    @InjectRepository(TableBooking)
    private tableBookingRepository: Repository<TableBooking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Cafe)
    private cafeRepository: Repository<Cafe>,
    private notificationService: NotificationService,
  ) {}

  async create(userId: number, createBookingDto: CreateTableBookingDto): Promise<TableBooking> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    const cafe = await this.cafeRepository.findOne({ where: { id: createBookingDto.cafeId } });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${createBookingDto.cafeId} not found.`);
    }

    const newBooking = this.tableBookingRepository.create({
      ...createBookingDto,
      date: new Date(createBookingDto.date), // تحويل string التاريخ إلى Date object
      user: user,
      cafe: cafe,
    });

    const savedBooking = await this.tableBookingRepository.save(newBooking);

    // **إرسال إشعار للمستخدم بأن الحجز معلق وبانتظار الموافقة**
    try {
      await this.notificationService.sendToSpecificUsers(
        [userId],
        'حجز طاولتك قيد المراجعة',
        `تم استلام طلب حجزك في ${savedBooking.cafe.name} بتاريخ ${savedBooking.date.toDateString()} الساعة ${savedBooking.time}. سنقوم بتأكيد الحجز قريباً.`,
        { bookingId: savedBooking.id.toString(), cafeId: savedBooking.cafe.id.toString(), status: BookingStatus.PENDING }
      );
    } catch (notificationError) {
      console.error('Failed to send pending booking notification:', notificationError);
    }

    return savedBooking;
  }

  async findAll(): Promise<TableBooking[]> {
    return this.tableBookingRepository.find({ relations: ['user', 'cafe'] });
  }

  // async FindOne(id: number): Promise<TableBooking> {
  //   const booking = await this.tableBookingRepository.findOne({ where: { id }, relations: ['user', 'cafe'] });
  //   if (!booking) {
  //     throw new NotFoundException(`Booking with ID ${id} not found.`);
  //   }
  //   return booking;
  // }
  
    async findOne(id: number): Promise<TableBooking> {
    const booking = await this.tableBookingRepository.findOne({ where: { id }});
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }
    return booking;
  } 

// src/table-booking/table-booking.service.ts

// ... (داخل TableBookingService) ...

async update(id: number, updateBookingDto: UpdateTableBookingDto): Promise<TableBooking> {
    const booking = await this.tableBookingRepository.findOne({ where: { id }});
        if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }
    booking.date = updateBookingDto.date ? new Date(updateBookingDto.date) : booking.date; // معالجة التاريخ
    booking.time = updateBookingDto.time ?? booking.time;
    booking.numberOfPeople = updateBookingDto.numberOfPeople ?? booking.numberOfPeople;
    booking.sessionType = updateBookingDto.sessionType ?? booking.sessionType;
    booking.notes = updateBookingDto.notes ?? booking.notes;

    return this.tableBookingRepository.save(booking); // حفظ التغييرات في DB
}

  async remove(id: number): Promise<void> {
    const result = await this.tableBookingRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Booking with ID ${id} not found.`);
    }
  }

  async findUserBookings(id: number): Promise<TableBooking[]> {
    const user = await this.userRepository.findOne({ where: { id: id } });
      // console.log('User ID received in service:', userId, 'Type:', typeof userId); // طبع الـ ID ونوعه
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return this.tableBookingRepository.find({ where: { user: { id: id } }, relations: ['user', 'cafe'] });
  }

  async findCafeBookings(cafeId: number): Promise<TableBooking[]> {
    const cafe = await this.cafeRepository.findOne({ where: { id: cafeId } });
    if (!cafe) {
      throw new NotFoundException(`Cafe with ID ${cafeId} not found.`);
    }
    return this.tableBookingRepository.find({ where: { cafe: { id: cafeId } }, relations: ['user', 'cafe'] });
  }

  // **دالة تحديث حالة الحجز (للمسؤول فقط)**
  async updateBookingStatus(
    bookingId: number,
    adminUserId: number, // معرف المسؤول الذي يقوم بالتحديث
    updateStatusDto: UpdateBookingStatusDto,
  ): Promise<TableBooking> {
    const booking = await this.tableBookingRepository.findOne({
      where: { id: bookingId },
      relations: ['user', 'cafe'], // نحتاج لبيانات المستخدم والكافيه لإرسال الإشعار
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found.`);
    }

    // **التحقق من الصلاحيات:**
    // فقط المسؤولون (ADMIN) يمكنهم تغيير حالة الحجز.
    const adminUser = await this.userRepository.findOne({ where: { id: adminUserId } });
    if (!adminUser || adminUser.userType !== UserType.ADMIN) {
      throw new ForbiddenException('Only admin users are authorized to update booking status.');
    }

    // التحقق من أن حالة الحجز ليست "مكتملة" أو "ملغاة" قبل التحديث
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException(`Cannot update status for a booking that is already ${booking.status}.`);
    }

    booking.status = updateStatusDto.status;
    booking.rejectionReason = updateStatusDto.rejectionReason;

    // التحقق إذا كانت الحالة مرفوضة ولم يتم توفير سبب
    if (booking.status === BookingStatus.REJECTED && !booking.rejectionReason) {
      throw new BadRequestException('Rejection reason is required when rejecting a booking.');
    }

    // إذا كانت الحالة ليست مرفوضة، تأكد من عدم وجود سبب رفض غير ضروري
    if (booking.status !== BookingStatus.REJECTED) {
        booking.rejectionReason = undefined;
    }


    const updatedBooking = await this.tableBookingRepository.save(booking);

    // **إرسال الإشعار بناءً على الحالة الجديدة**
    let notificationTitle: string;
    let notificationBody: string;

    if (updatedBooking.status === BookingStatus.CONFIRMED) {
      notificationTitle = 'تم تأكيد حجز طاولتك!';
      notificationBody = `تهانينا! تم تأكيد حجزك في ${updatedBooking.cafe.name} بتاريخ الساعة ${updatedBooking.time}.`;
    } else if (updatedBooking.status === BookingStatus.REJECTED) {
      notificationTitle = 'تم رفض حجز طاولتك';
      notificationBody = `نأسف، تم رفض حجزك في ${updatedBooking.cafe.name} بتاريخ الساعة ${updatedBooking.time}. السبب: ${updatedBooking.rejectionReason || 'لا يوجد سبب محدد.'}`;
    } else if (updatedBooking.status === BookingStatus.CANCELLED) {
       notificationTitle = 'تم إلغاء حجز طاولتك';
       notificationBody = `تم إلغاء حجزك في ${updatedBooking.cafe.name} بتاريخ 
        الساعة ${updatedBooking.time}.`;
    } else {
        notificationTitle = 'تحديث حجز الطاولة';
        notificationBody = `تم تحديث حالة حجزك في ${updatedBooking.cafe.name} إلى ${updatedBooking.status}.`;
    }

    try {
      await this.notificationService.sendToSpecificUsers(
        [updatedBooking.user.id],
        notificationTitle,
        notificationBody,
        {
          bookingId: updatedBooking.id.toString(),
          cafeId: updatedBooking.cafe.id.toString(),
          status: updatedBooking.status,
        }
      );
    } catch (notificationError) {
      console.error('Failed to send booking status notification:', notificationError);
    }

    return updatedBooking;
  }
}
/* eslint-disable prettier/prettier */
// src/utils/enums/booking-status.enum.ts
export enum BookingStatus {
  PENDING = 'معلق',      // الحجز بانتظار الموافقة
  CONFIRMED = 'مؤكد',    // تم قبول الحجز
  REJECTED = 'مرفوض',    // تم رفض الحجز
  CANCELLED = 'ملغى',    // تم إلغاء الحجز من قبل المستخدم أو الكافيه
  COMPLETED = 'مكتمل',   // تم الانتهاء من الحجز (بعد التاريخ والوقت)
}
/* eslint-disable prettier/prettier */
// src/utils/enums/order-status.enum.ts
export enum OrderStatus {
  PENDING = 'قيد المعالجة', // الطلب معلق بانتظار الموافقة أو التحضير
  PREPARING = 'قيد التحضير', // الطلب قيد التحضير
  READY_FOR_PICKUP = 'جاهز للاستلام', // الطلب جاهز (إذا كانت طريقة الاستلام هي سفري أو طاولة)
  COMPLETED = 'مكتمل', // الطلب اكتمل (تم الاستلام/التسليم)
  CANCELLED = 'ملغى', // الطلب تم إلغاؤه
}

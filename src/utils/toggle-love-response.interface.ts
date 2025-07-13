/* eslint-disable prettier/prettier */
// src/love/types/toggle-love-response.interface.ts (ملف جديد)
import { Love } from '../love/love.entity'; // تأكد من المسار الصحيح لكيان Love

export interface ToggleLoveResponse {
  action: 'added' | 'removed';
  love?: Love[]; // الكائن الذي تم إضافته إذا كانت العملية "added"
}
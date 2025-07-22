/* eslint-disable prettier/prettier */
export enum UserType {
    ADMIN = 'admin',
    NORMAL_USER = 'normal_user',
    CAFE_OWNER = 'cafe_owner'
}
export enum Gender{
      Male = 'ذكر',
  Female = 'أنثى',
}

export enum type{
 sport = 'sport',
  public = 'public',
  study='study',
  tourist='tourist'
}

export enum ProductType {
  DRINK = 'مشروب',
  FOOD = 'مأكولات',
}

export enum CafeStatus { 
    PENDING = 'معلق', 
    APPROVED = 'موافق عليه', 
    REJECTED = 'مرفوض',
    DISABLED = 'معطل', 
}
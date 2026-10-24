export enum TrackingFactorType {
  SIMPLE_INTEGER = 1, // عدد ساده
  DECIMAL = 2,        // عدد اعشاری
  BOOLEAN = 3,        // بولیین
  DATE = 4,           // تاریخ
  TIME = 5,           // ساعت
  TEXT = 6,           // حرفی
  COLOR = 7,          // رنگ
  NUMBER_RANGE = 8,   // بازه اعداد
}

export const TrackingFactorTypeLabels: Record<number, string> = {
  [TrackingFactorType.SIMPLE_INTEGER]: 'عدد ساده',
  [TrackingFactorType.DECIMAL]: 'عدد اعشاری',
  [TrackingFactorType.BOOLEAN]: 'بولیین',
  [TrackingFactorType.DATE]: 'تاریخ',
  [TrackingFactorType.TIME]: 'ساعت',
  [TrackingFactorType.TEXT]: 'حرفی',
  [TrackingFactorType.COLOR]: 'رنگ',
  [TrackingFactorType.NUMBER_RANGE]: 'بازه اعداد',
};

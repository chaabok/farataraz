export enum ItemType {
  GOODS = 1,     // کالا
  SERVICE = 2,   // خدمت
}

export enum PricingMethod {
  WEIGHTED_AVERAGE = 1,        // میانگین موزون
  FIFO = 2,                    // نخستین ورودی، نخستین خروجی
  LIFO = 3,                    // آخرین ورودی، نخستین خروجی
  STANDARD_RATE = 4,           // نرخ استاندارد
}

export enum TaxAndDutyExemption {
  NONE = 1,            // غیر معاف
  SALE_EXEMPT = 2,     // معاف در فروش
  PURCHASE_EXEMPT = 3, // معاف در خرید
  BOTH_EXEMPT = 4,     // معاف در خرید و فروش
}

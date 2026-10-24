// Rule 13: Enum for static options
export enum PricingType {
  Receipt = 1, // رسیدهای انبار
  Issue = 2,   // حواله‌های انبار
}

export const PRICING_TYPE_OPTIONS = [
  { value: PricingType.Receipt, label: 'رسید انبار' },
  { value: PricingType.Issue, label: 'حواله انبار' },
];

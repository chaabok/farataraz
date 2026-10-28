import { IsInt, IsNotEmpty, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/** یک ردیف از تنظیمات «نمایش عامل ردیابی در فرم های فروش» برای یک نوع سند فروش */
export class UpsertSalesTrackingFactorSettingDto {
  /** ID از enum SalesDocumentType (1..7) */
  @IsInt({ message: 'نوع سند فروش الزامی است' })
  @IsNotEmpty({ message: 'نوع سند فروش نمی‌تواند خالی باشد' })
  @Min(1, { message: 'نوع سند فروش نامعتبر است' })
  @Max(7, { message: 'نوع سند فروش نامعتبر است' })
  SalesDocumentType!: number;

  @IsBoolean({ message: 'مقدار نمایش عامل ردیابی باید true یا false باشد' })
  ShowTrackingFactor!: boolean;
}

/** بدنه درخواست ذخیره گروهی: { settings: [{ SalesDocumentType, ShowTrackingFactor }] } */
export class UpsertSalesTrackingFactorSettingsDto {
  @IsArray({ message: 'لیست تنظیمات باید آرایه باشد' })
  @ValidateNested({ each: true })
  @Type(() => UpsertSalesTrackingFactorSettingDto)
  settings!: UpsertSalesTrackingFactorSettingDto[];
}

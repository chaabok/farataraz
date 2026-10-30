import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------------------------------------
// Task 133: DTOهای مجوز فروش — همانند فاکتور فروش بدون فیلد «تاریخ اعتبار»
// ---------------------------------------------------------------------------
export class SalesPermissionItemDto {
  @IsOptional()
  RowNo?: number;

  @IsOptional()
  ItemRef?: any;

  @IsOptional()
  ItemCode?: any;

  @IsOptional()
  ItemName?: any;

  @IsOptional()
  UnitName?: any;

  @IsOptional()
  Quantity?: any;

  @IsOptional()
  UnitPrice?: any;

  @IsOptional()
  TotalPrice?: any;

  @IsOptional()
  Description?: any;

  // مقادیر عوامل ردیابی ردیف (خروجی مودال عامل ردیابی)
  @IsOptional()
  trackingFactorValues?: any;
}

// ردیف عامل مجوز فروش (اضافات/کسورات)
export class SalesPermissionFactorDto {
  @IsOptional()
  RowNo?: any;

  @IsOptional()
  FactorTitle?: any;

  @IsOptional()
  FactorType?: any;

  @IsOptional()
  Amount?: any;

  @IsOptional()
  Description?: any;
}

export class CreateSalesPermissionDto {
  @IsOptional()
  PermissionNumber?: any;

  @IsOptional()
  PermissionDate?: any;

  @IsOptional()
  CustomerRef?: any;

  @IsOptional()
  CustomerName?: any;

  @IsOptional()
  SalesTypeRef?: any;

  @IsOptional()
  SalesCenterRef?: any;

  @IsOptional()
  DeliveryLocationRef?: any;

  @IsOptional()
  SettlementMethodRef?: any;

  @IsOptional()
  Status?: any;

  // توضیحات مجوز فروش
  @IsOptional()
  Description?: any;

  // نوع سند مبنا (0=بدون مبنا) + ارجاع به سند مبنا مشخص
  @IsOptional()
  BaseDocumentTypeRef?: any;

  @IsOptional()
  BaseDocumentRef?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesPermissionItemDto)
  items?: SalesPermissionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesPermissionFactorDto)
  factors?: SalesPermissionFactorDto[];
}

export class UpdateSalesPermissionDto extends CreateSalesPermissionDto {}

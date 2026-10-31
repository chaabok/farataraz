import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------------------------------------
// Task 139: DTOهای مجوز برگشت از فروش — کلون DTOهای مجوز فروش (Task 133)
// ---------------------------------------------------------------------------
export class SalesReturnPermissionItemDto {
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

// ردیف عامل مجوز برگشت از فروش (اضافات/کسورات)
export class SalesReturnPermissionFactorDto {
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

export class CreateSalesReturnPermissionDto {
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

  // توضیحات مجوز برگشت از فروش
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
  @Type(() => SalesReturnPermissionItemDto)
  items?: SalesReturnPermissionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesReturnPermissionFactorDto)
  factors?: SalesReturnPermissionFactorDto[];
}

export class UpdateSalesReturnPermissionDto extends CreateSalesReturnPermissionDto {}

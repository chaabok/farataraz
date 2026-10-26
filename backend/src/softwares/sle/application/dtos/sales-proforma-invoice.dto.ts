import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------------------------------------
// Task 88: DTOهای پیش فاکتور فروش — همانند سفارش فروش + فیلد ValidityDate (تاریخ اعتبار)
// ---------------------------------------------------------------------------
export class SalesProformaInvoiceItemDto {
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

// ردیف عامل پیش فاکتور فروش (اضافات/کسورات)
export class SalesProformaInvoiceFactorDto {
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

export class CreateSalesProformaInvoiceDto {
  @IsOptional()
  ProformaNumber?: any;

  @IsOptional()
  ProformaDate?: any;

  // تاریخ اعتبار پیش فاکتور
  @IsOptional()
  ValidityDate?: any;

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

  @IsOptional()
  Description?: any;

  // Task 93: نوع سند مبنا (0=بدون مبنا) + ارجاع به سند مبنا مشخص
  @IsOptional()
  BaseDocumentTypeRef?: any;

  @IsOptional()
  BaseDocumentRef?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesProformaInvoiceItemDto)
  items?: SalesProformaInvoiceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesProformaInvoiceFactorDto)
  factors?: SalesProformaInvoiceFactorDto[];
}

export class UpdateSalesProformaInvoiceDto extends CreateSalesProformaInvoiceDto {}

import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------------------------------------
// Task 130: DTOهای فاکتور فروش — همانند پیش فاکتور فروش بدون فیلد «تاریخ اعتبار»
// ---------------------------------------------------------------------------
export class SalesInvoiceItemDto {
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

// ردیف عامل فاکتور فروش (اضافات/کسورات)
export class SalesInvoiceFactorDto {
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

export class CreateSalesInvoiceDto {
  @IsOptional()
  InvoiceNumber?: any;

  @IsOptional()
  InvoiceDate?: any;

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

  // توضیحات فاکتور فروش
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
  @Type(() => SalesInvoiceItemDto)
  items?: SalesInvoiceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesInvoiceFactorDto)
  factors?: SalesInvoiceFactorDto[];
}

export class UpdateSalesInvoiceDto extends CreateSalesInvoiceDto {}

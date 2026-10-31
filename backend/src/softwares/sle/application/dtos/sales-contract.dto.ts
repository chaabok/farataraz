import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// ---------------------------------------------------------------------------
// Task 128: DTOهای قرارداد فروش — همانند پیش فاکتور فروش با فیلدهای:
// ContractDate (تاریخ قرارداد) و ContractSubject (موضوع قرارداد)
// ---------------------------------------------------------------------------
export class SalesContractItemDto {
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

// ردیف عامل قرارداد فروش (اضافات/کسورات)
export class SalesContractFactorDto {
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

export class CreateSalesContractDto {
  @IsOptional()
  ContractNumber?: any;

  @IsOptional()
  DocumentDate?: any;

  // تاریخ قرارداد (برچسب جدید «تاریخ اعتبار» پیش فاکتور)
  @IsOptional()
  ContractDate?: any;

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

  // موضوع قرارداد (برچسب جدید «توضیحات» پیش فاکتور)
  @IsOptional()
  ContractSubject?: any;

  // نوع سند مبنا (0=بدون مبنا) + ارجاع به سند مبنا مشخص
  @IsOptional()
  BaseDocumentTypeRef?: any;

  @IsOptional()
  BaseDocumentRef?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesContractItemDto)
  items?: SalesContractItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesContractFactorDto)
  factors?: SalesContractFactorDto[];
}

export class UpdateSalesContractDto extends CreateSalesContractDto {}

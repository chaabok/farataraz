import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SalesOrderItemDto {
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

  // Task 74: مقادیر عوامل ردیابی ردیف (خروجی مودال عامل ردیابی)
  @IsOptional()
  trackingFactorValues?: any;
}

// Task 85: ردیف عامل سفارش فروش (اضافات/کسورات) — همانند رسید انبار
export class SalesOrderFactorDto {
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

export class CreateSalesOrderDto {
  @IsOptional()
  OrderNumber?: any;

  @IsOptional()
  OrderDate?: any;

  @IsOptional()
  DeliveryDate?: any;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  items?: SalesOrderItemDto[];

  // Task 85: عوامل سفارش فروش (اضافات/کسورات)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderFactorDto)
  factors?: SalesOrderFactorDto[];
}

export class UpdateSalesOrderDto extends CreateSalesOrderDto {}

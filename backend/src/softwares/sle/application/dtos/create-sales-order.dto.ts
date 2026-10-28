import { IsOptional, IsString, IsNumber } from 'class-validator';

export class SalesOrderDetailDto {
  @IsOptional()
  @IsNumber()
  RowNo?: number;

  @IsOptional()
  ItemRef?: any;

  @IsOptional()
  @IsString()
  UnitName?: string;

  @IsOptional()
  UnitType?: any;

  @IsOptional()
  @IsNumber()
  Quantity?: number;

  @IsOptional()
  @IsNumber()
  UnitPrice?: number;

  @IsOptional()
  @IsNumber()
  Discount?: number;

  @IsOptional()
  @IsNumber()
  TotalPrice?: number;

  @IsOptional()
  @IsNumber()
  PriceAfterDiscount?: number;

  @IsOptional()
  @IsNumber()
  Additions?: number;

  @IsOptional()
  @IsNumber()
  VatTax?: number;

  @IsOptional()
  @IsNumber()
  Deductions?: number;

  @IsOptional()
  @IsNumber()
  NetPrice?: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  trackingFactorValues?: any;

  @IsOptional()
  TrackingFactorValues?: any;
}

export class SalesOrderFactorDto {
  @IsOptional()
  @IsNumber()
  RowNo?: number;

  @IsOptional()
  @IsString()
  FactorTitle?: string;

  @IsOptional()
  FactorType?: any;

  @IsOptional()
  Amount?: any;

  @IsOptional()
  PurchaseSalesParameterRef?: any;

  @IsOptional()
  CategoryOther?: any;

  @IsOptional()
  @IsString()
  Description?: string;
}

export class CreateSalesOrderDto {
  @IsOptional()
  SalesOrderID?: number;

  @IsOptional()
  SalesOrderNumber?: any;

  @IsOptional()
  SalesOrderDate?: any;

  @IsOptional()
  CustomerRef?: any;

  @IsOptional()
  @IsString()
  CustomerName?: string;

  @IsOptional()
  SalesTypeRef?: any;

  @IsOptional()
  DeliveryLocationRef?: any;

  @IsOptional()
  SettleMethodRef?: any;

  @IsOptional()
  @IsString()
  SettleMethodTitle?: string;

  @IsOptional()
  Status?: any;

  @IsOptional()
  CurrencyRef?: any;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  details?: SalesOrderDetailDto[];

  @IsOptional()
  factors?: SalesOrderFactorDto[];
}

export class UpdateSalesOrderDto extends CreateSalesOrderDto {}

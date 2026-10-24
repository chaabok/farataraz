import { IsOptional, IsNumber, IsString, IsArray } from 'class-validator';

export class ServicePurchaseInvoiceDetailDto {
  @IsOptional()
  @IsNumber()
  ServicePurchaseInvoiceDetailID?: number;

  @IsOptional()
  @IsNumber()
  RowNo?: number;

  @IsOptional()
  @IsNumber()
  ItemRef?: number;

  @IsOptional()
  @IsNumber()
  UnitType?: number;

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
  @IsString()
  Description?: string;
}

export class ServicePurchaseInvoiceFactorDto {
  @IsOptional()
  @IsNumber()
  ServicePurchaseInvoiceFactorID?: number;

  @IsOptional()
  @IsNumber()
  RowNo?: number;

  @IsOptional()
  @IsString()
  FactorTitle?: string;

  @IsOptional()
  @IsNumber()
  FactorType?: number;

  @IsOptional()
  @IsNumber()
  Amount?: number;

  @IsOptional()
  @IsString()
  Description?: string;
}

export class CreateServicePurchaseInvoiceDto {
  @IsOptional()
  @IsNumber()
  BaseType?: number;

  @IsOptional()
  @IsNumber()
  SupplyRequestRef?: number;

  @IsOptional()
  @IsNumber()
  SupplierRef?: number;

  @IsOptional()
  @IsString()
  SupplierName?: string;

  @IsOptional()
  @IsNumber()
  InvoiceNumber?: number;

  @IsOptional()
  @IsString()
  InvoiceDate?: string;

  @IsOptional()
  @IsString()
  BaseDocumentNumber?: string;

  @IsOptional()
  @IsNumber()
  Status?: number;

  @IsOptional()
  @IsNumber()
  CurrencyRef?: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsArray()
  items?: any[];

  @IsOptional()
  @IsArray()
  factors?: any[];
}

export class UpdateServicePurchaseInvoiceDto extends CreateServicePurchaseInvoiceDto {}

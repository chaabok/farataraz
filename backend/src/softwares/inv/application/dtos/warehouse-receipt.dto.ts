import { IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class WarehouseReceiptDetailDto {
  @IsOptional()
  @IsNumber()
  RowNo?: number;

  @IsOptional()
  ItemRef?: any;

  @IsOptional()
  WarehouseRef?: any;

  @IsOptional()
  @IsString()
  BaseNumber?: string;

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

export class WarehouseReceiptFactorDto {
  @IsOptional()
  @IsNumber()
  RowNo?: number;

  @IsOptional()
  @IsString()
  FactorTitle?: string;

  @IsOptional()
  FactorType?: any;

  @IsOptional()
  @IsNumber()
  Amount?: number;

  @IsOptional()
  @IsString()
  Description?: string;
}

export class CreateWarehouseReceiptDto {
  @IsOptional()
  BaseType?: any;

  @IsOptional()
  WarehouseDocumentTypeRef?: any;

  @IsOptional()
  WarehouseRef?: any;

  @IsOptional()
  @IsString()
  WarehouseName?: string;

  @IsOptional()
  TemporaryReceiptRef?: any;

  @IsOptional()
  SupplyRequestRef?: any;

  @IsOptional()
  PurchaseInvoiceRef?: any;

  // Task 136: فاکتور فروش مبنا — پیوند حواله انبار با Sle.SalesInvoices
  @IsOptional()
  SalesInvoiceRef?: any;

  @IsOptional()
  SupplierRef?: any;

  @IsOptional()
  @IsString()
  SupplierName?: string;

  @IsOptional()
  ReceiptNumber?: any;

  @IsOptional()
  ReceiptDate?: any;

  @IsOptional()
  @IsString()
  BaseDocumentNumber?: string;

  @IsOptional()
  Status?: any;

  @IsOptional()
  CurrencyRef?: any;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseReceiptDetailDto)
  details?: WarehouseReceiptDetailDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseReceiptFactorDto)
  factors?: WarehouseReceiptFactorDto[];
}

export class UpdateWarehouseReceiptDto extends CreateWarehouseReceiptDto {}

export class PriceReceiptItemRequestDto {
  @IsOptional()
  RowNo?: number;

  @IsOptional()
  ItemRef?: any;

  @IsOptional()
  ItemCode?: any;

  @IsOptional()
  ItemName?: string;

  @IsOptional()
  Quantity?: number;

  @IsOptional()
  UnitPrice?: number;
}

export class PriceReceiptItemsDto {
  @IsString()
  pricingMethod: 'standardRate' | 'lastPurchase' | 'lastConsumption';

  @IsOptional()
  ReceiptDate?: any;

  @IsOptional()
  WarehouseReceiptID?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceReceiptItemRequestDto)
  items: PriceReceiptItemRequestDto[];
}

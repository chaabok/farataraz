import { IsOptional, IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TemporaryItemReceiptDetailDto {
  @IsOptional()
  @IsNumber()
  TemporaryItemReceiptDetailID?: number;

  @IsOptional()
  @IsNumber()
  RowNo?: number;

  @IsOptional()
  @IsNumber()
  ItemRef?: number;

  @IsOptional()
  @IsString()
  BaseNumber?: string;

  @IsOptional()
  @IsString()
  UnitName?: string;

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

  @IsOptional()
  trackingFactorValues?: any;

  @IsOptional()
  trackingFactors?: any;
}

export class TemporaryItemReceiptFactorDto {
  @IsOptional()
  @IsNumber()
  TemporaryItemReceiptFactorID?: number;

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

export class CreateTemporaryItemReceiptDto {
  @IsOptional()
  @IsNumber()
  Type?: number;

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
  ReceiptNumber?: number;

  @IsOptional()
  ReceiptDate?: Date | string;

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
  @ValidateNested({ each: true })
  @Type(() => TemporaryItemReceiptDetailDto)
  details?: TemporaryItemReceiptDetailDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemporaryItemReceiptFactorDto)
  factors?: TemporaryItemReceiptFactorDto[];
}

export class UpdateTemporaryItemReceiptDto extends CreateTemporaryItemReceiptDto {}

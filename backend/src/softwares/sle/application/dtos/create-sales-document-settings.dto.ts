import { IsInt, IsNotEmpty, IsOptional, IsBoolean, IsString, Min, Max } from 'class-validator';
import { isValidSalesDocumentType } from '../../domain/entities/sales-document-type.enum';

export class CreateSalesDocumentSettingsDto {
  @IsOptional()
  SalesDocumentSettingsID?: number;

  /** ID از enum SalesDocumentType — اجباری، نمی‌تواند خالی باشد */
  @IsInt({ message: 'نوع سند فروش الزامی است' })
  @IsNotEmpty({ message: 'نوع سند فروش نمی‌تواند خالی باشد' })
  @Min(1, { message: 'نوع سند فروش نامعتبر است' })
  @Max(7, { message: 'نوع سند فروش نامعتبر است' })
  SalesDocumentType!: number;

  @IsOptional()
  @IsBoolean()
  HasBaseDocument?: boolean;

  /** comma-separated SalesDocumentType IDs */
  @IsOptional()
  @IsString()
  BaseDocumentTypes?: string | null;

  @IsOptional()
  @IsBoolean()
  ShowWarehouse?: boolean;

  @IsOptional()
  DefaultWarehouseRef?: number | null;

  @IsOptional()
  @IsBoolean()
  ShowSalesCenter?: boolean;

  @IsOptional()
  DefaultSalesCenterRef?: number | null;

  @IsOptional()
  @IsBoolean()
  ShowSalesType?: boolean;

  @IsOptional()
  DefaultSalesTypeRef?: number | null;

  @IsOptional()
  @IsBoolean()
  ShowDeliveryLocations?: boolean;

  @IsOptional()
  DefaultDeliveryLocationRef?: number | null;

  @IsOptional()
  @IsBoolean()
  ShowSettlementMethod?: boolean;

  @IsOptional()
  DefaultSettlementMethodRef?: number | null;

  @IsOptional()
  @IsBoolean()
  HasAccountingDocument?: boolean;

  @IsOptional()
  @IsBoolean()
  ShowPurchaseSalesParameters?: boolean;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;
}

export class UpdateSalesDocumentSettingsDto extends CreateSalesDocumentSettingsDto {}

export function assertValidSalesDocumentType(dto: CreateSalesDocumentSettingsDto): void {
  if (!isValidSalesDocumentType(dto.SalesDocumentType)) {
    throw new Error('نوع سند فروش نامعتبر است. باید یکی از انواع تعریف‌شده باشد.');
  }
}

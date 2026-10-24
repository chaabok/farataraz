import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

function TransformToNumber({ value }: { value: any }) {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

export class CreateWarehouseDocumentTypeDto {
  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseDocumentTypeCode?: number;

  @IsOptional()
  @IsString()
  WarehouseDocumentTypeTitle?: string;

  @IsOptional()
  @IsString()
  WarehouseDocumentTypeTitle2?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseDocumentNature?: number;

  @IsOptional()
  @IsBoolean()
  HasBaseDocument?: boolean;

  @IsOptional()
  BaseDocumentTypeRefs?: any;

  @IsOptional()
  @IsString()
  WarehouseName?: string;

  @IsOptional()
  @IsString()
  DetailedName?: string;

  @IsOptional()
  RelatedDetailedTypeRefs?: any;

  @IsOptional()
  DisplayableItemNatures?: any;

  @IsOptional()
  @IsBoolean()
  ShowPurchaseSalesParameters?: boolean;

  @IsOptional()
  @IsBoolean()
  HasAccountingDocument?: boolean;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  companyRef?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  businessStructureRef?: number;
}


import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateItemDto {
  @IsOptional()
  @IsNumber()
  ItemType?: number;

  @IsOptional()
  ItemCode?: any;

  @IsOptional()
  @IsString()
  ItemName?: string;

  @IsOptional()
  @IsString()
  ItemName2?: string;

  @IsOptional()
  @IsNumber()
  MeasurementUnitRef?: number;

  @IsOptional()
  @IsString()
  TechnicalSpecification?: string;

  @IsOptional()
  @IsString()
  DetailedAccountCode?: string;

  @IsOptional()
  @IsNumber()
  TaxRate?: number;

  @IsOptional()
  @IsNumber()
  DutyRate?: number;

  @IsOptional()
  @IsString()
  IranCode?: string;

  @IsOptional()
  @IsNumber()
  ItemAccountCategoryRef?: number;

  @IsOptional()
  @IsNumber()
  PricingMethod?: number;

  @IsOptional()
  @IsNumber()
  TaxAndDutyExemption?: number;

  @IsOptional()
  @IsBoolean()
  IsSalable?: boolean;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsNumber()
  companyRef?: number;

  @IsOptional()
  @IsNumber()
  businessStructureRef?: number;

  @IsOptional()
  ItemPhysicalLocations?: any[];

  @IsOptional()
  ItemSubUnits?: any[];

  @IsOptional()
  ItemInventoryControls?: any[];

  @IsOptional()
  ItemVolumeCbms?: any[];

  @IsOptional()
  ItemSimilarItems?: any[];
}

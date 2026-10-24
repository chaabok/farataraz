import { IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StocktakingTagDetailDto {
  @IsOptional()
  StocktakingTagDetailID?: number;

  @IsOptional()
  WarehouseRef?: any;

  @IsOptional()
  warehouseRef?: any;

  @IsOptional()
  WarehouseID?: any;

  @IsOptional()
  warehouseId?: any;

  @IsOptional()
  ItemRef?: any;

  @IsOptional()
  itemRef?: any;

  @IsOptional()
  ItemID?: any;

  @IsOptional()
  itemId?: any;

  @IsOptional()
  TagNumber?: any;

  @IsOptional()
  tagNumber?: any;
}

export class CreateStocktakingTagHeaderDto {
  @IsOptional()
  StocktakingPeriod?: any;

  @IsOptional()
  stocktakingPeriod?: any;

  @IsOptional()
  StocktakingSettingRef?: any;

  @IsOptional()
  stocktakingSettingRef?: any;

  @IsOptional()
  methodRef?: any;

  @IsOptional()
  StocktakingDate?: any;

  @IsOptional()
  stocktakingDate?: any;

  @IsOptional()
  StocktakingNumber?: any;

  @IsOptional()
  stocktakingNumber?: any;

  @IsOptional()
  OfficerPartyRef?: any;

  @IsOptional()
  officerPartyRef?: any;

  @IsOptional()
  Description?: any;

  @IsOptional()
  description?: any;

  @IsOptional()
  FiscalYearRef?: any;

  @IsOptional()
  fiscalYearRef?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StocktakingTagDetailDto)
  details?: StocktakingTagDetailDto[];
}

export class UpdateStocktakingTagHeaderDto {
  @IsOptional()
  StocktakingPeriod?: any;

  @IsOptional()
  stocktakingPeriod?: any;

  @IsOptional()
  StocktakingSettingRef?: any;

  @IsOptional()
  stocktakingSettingRef?: any;

  @IsOptional()
  methodRef?: any;

  @IsOptional()
  StocktakingDate?: any;

  @IsOptional()
  stocktakingDate?: any;

  @IsOptional()
  StocktakingNumber?: any;

  @IsOptional()
  stocktakingNumber?: any;

  @IsOptional()
  OfficerPartyRef?: any;

  @IsOptional()
  officerPartyRef?: any;

  @IsOptional()
  Description?: any;

  @IsOptional()
  description?: any;

  @IsOptional()
  FiscalYearRef?: any;

  @IsOptional()
  fiscalYearRef?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StocktakingTagDetailDto)
  details?: StocktakingTagDetailDto[];
}

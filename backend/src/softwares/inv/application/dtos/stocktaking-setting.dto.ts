import { IsString, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

function TransformToNumber({ value }: { value: any }) {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

export class CreateStocktakingSettingDto {
  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  StocktakingSettingID?: number;

  @IsOptional()
  @IsString()
  MethodName?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  CountTimes?: number;

  @IsOptional()
  @IsBoolean()
  CountWithTrackingFactors?: boolean;

  // Count 1
  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  Count1MinQty?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  Count1MinRial?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  Count1MinTurnover?: number;

  // Count 2
  @IsOptional()
  @IsString()
  Count2ListType?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  Count2DiscrepancyPercent?: number;

  // Count 3
  @IsOptional()
  @IsString()
  Count3CombineType?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  Count3DiscrepancyPercent?: number;

  @IsOptional()
  @IsBoolean()
  Count3Discrepancy1And2?: boolean;

  @IsOptional()
  @IsBoolean()
  Count3Discrepancy1AndInv?: boolean;

  @IsOptional()
  @IsBoolean()
  Count3Discrepancy2AndInv?: boolean;

  @IsOptional()
  @IsArray()
  warehouseIds?: number[];
}

export class UpdateStocktakingSettingDto extends CreateStocktakingSettingDto {}

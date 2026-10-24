import { IsNotEmpty, IsOptional, IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StocktakingCountTrackingFactorDto {
  @IsOptional()
  @IsNumber()
  StocktakingCountTrackingFactorID?: number;

  @IsNotEmpty()
  @IsNumber()
  TrackingFactorRef: number;

  @IsOptional()
  @IsString()
  FactorValue?: string;

  @IsNotEmpty()
  @IsNumber()
  CountedQuantity: number;
}

export class StocktakingCountDetailDto {
  @IsOptional()
  @IsNumber()
  StocktakingCountDetailID?: number;

  @IsNotEmpty()
  @IsNumber()
  RowNumber: number;

  @IsNotEmpty()
  @IsNumber()
  ItemRef: number;

  @IsOptional()
  @IsString()
  TagNumber?: string;

  @IsNotEmpty()
  @IsNumber()
  CountedQuantity: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StocktakingCountTrackingFactorDto)
  trackingFactors?: StocktakingCountTrackingFactorDto[];
}

export class CreateStocktakingCountDto {
  @IsNotEmpty()
  @IsNumber()
  StocktakingTagHeaderRef: number;

  @IsNotEmpty()
  @IsNumber()
  WarehouseRef: number;

  @IsNotEmpty()
  @IsString()
  StocktakingDate: string;

  @IsOptional()
  @IsNumber()
  StocktakingNumber?: number;

  @IsOptional()
  @IsNumber()
  CountRound?: number;

  @IsOptional()
  @IsNumber()
  Status?: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  FiscalYearRef?: number;

  @IsOptional()
  @IsNumber()
  BusinessStructureRef?: number;

  @IsOptional()
  @IsNumber()
  CompanyRef?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StocktakingCountDetailDto)
  details?: StocktakingCountDetailDto[];
}

export class UpdateStocktakingCountDto extends CreateStocktakingCountDto {
  @IsOptional()
  @IsNumber()
  StocktakingCountID?: number;
}

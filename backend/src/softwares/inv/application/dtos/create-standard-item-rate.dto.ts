import { IsOptional, IsNumber, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { parseToIsoDateString } from '../../../../core/utils/date-parser';

export class StandardItemRateDetailDto {
  @IsOptional()
  @IsNumber()
  StandardItemRateDetailID?: number;

  @IsOptional()
  @IsNumber()
  ItemRef?: number;

  @IsOptional()
  @IsNumber()
  UnitRate?: number;
}

export class CreateStandardItemRateDto {
  @IsOptional()
  @IsNumber()
  ItemAccountCategoryRef?: number | null;

  @IsOptional()
  @IsString()
  @Transform(parseToIsoDateString)
  EffectiveDate?: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  companyRef?: number;

  @IsOptional()
  @IsNumber()
  businessStructureRef?: number;

  @IsOptional()
  @IsNumber()
  FiscalYearRef?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StandardItemRateDetailDto)
  details?: StandardItemRateDetailDto[];
}


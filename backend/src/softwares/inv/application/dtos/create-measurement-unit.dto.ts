import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateMeasurementUnitDto {
  @IsOptional()
  @IsNumber()
  MeasurementUnitCode?: number;

  @IsOptional()
  @IsString()
  MeasurementUnitName?: string;

  @IsOptional()
  @IsString()
  MeasurementUnitName2?: string;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsNumber()
  businessStructureRef?: number;

  @IsOptional()
  @IsNumber()
  companyRef?: number;
}

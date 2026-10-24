import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

function TransformToNumber({ value }: { value: any }) {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

export class ParameterValueDto {
  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  PurchaseSalesParameterValueID?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  RowNo?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : undefined))
  @IsString()
  StartDate?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : undefined))
  @IsString()
  EndDate?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  ParameterValue?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : undefined))
  @IsString()
  Description?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  ProductServiceRef?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : undefined))
  @IsString()
  ProductServiceCode?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : undefined))
  @IsString()
  ProductServiceName?: string;

  @IsOptional()
  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : undefined))
  @IsString()
  MeasurementUnitName?: string;
}

export class CreatePurchaseSalesParameterDto {
  @IsOptional()
  @IsBoolean()
  IsProcurement?: boolean;

  @IsOptional()
  @IsBoolean()
  IsWarehouse?: boolean;

  @IsOptional()
  @IsBoolean()
  IsSales?: boolean;

  @IsOptional()
  @IsString()
  Title?: string;

  @IsOptional()
  @IsString()
  Title2?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  CalculationPriority?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  PrintPriority?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  ParameterType?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  CalculationMethod?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  CalculationCondition?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  RelationType?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  OperationType?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  AmountAllocationMethod?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  CategoryOther?: number;

  @IsOptional()
  @IsBoolean()
  HasAccountingVoucher?: boolean;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  SlAccountRef?: number;

  @IsOptional()
  @IsBoolean()
  IsNonDefiniteAmount?: boolean;

  @IsOptional()
  @IsBoolean()
  IsMandatory?: boolean;

  @IsOptional()
  @IsBoolean()
  IsFactorValueEditableByUser?: boolean;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Description?: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParameterValueDto)
  ParameterValues?: ParameterValueDto[];
}

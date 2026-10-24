import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReportFieldDto {
  @IsString()
  @IsOptional()
  reportFieldID?: string;

  @IsString()
  @IsOptional()
  tableName?: string;

  @IsString()
  @IsOptional()
  fieldName?: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsOptional()
  orderIndex?: number;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}

export class ReportGroupingDto {
  @IsString()
  @IsOptional()
  reportGroupingID?: string;

  @IsString()
  @IsOptional()
  tableName?: string;

  @IsString()
  @IsOptional()
  fieldName?: string;

  @IsOptional()
  orderIndex?: number;
}

export class ReportFilterDto {
  @IsString()
  @IsOptional()
  reportFilterID?: string;

  @IsString()
  @IsOptional()
  tableName?: string;

  @IsString()
  @IsOptional()
  fieldName?: string;

  @IsString()
  @IsOptional()
  operator?: string;

  @IsString()
  @IsOptional()
  valueType?: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  logicalOperator?: string;

  @IsOptional()
  orderIndex?: number;
}

export class ReportSortingDto {
  @IsString()
  @IsOptional()
  reportSortingID?: string;

  @IsString()
  @IsOptional()
  tableName?: string;

  @IsString()
  @IsOptional()
  fieldName?: string;

  @IsString()
  @IsOptional()
  sortDirection?: string;

  @IsOptional()
  orderIndex?: number;
}

export class ReportFormulaDto {
  @IsString()
  @IsOptional()
  reportFormulaID?: string;

  @IsString()
  @IsOptional()
  formulaName?: string;

  @IsString()
  @IsOptional()
  expression?: string;
}

export class ReportAggregateDto {
  @IsString()
  @IsOptional()
  reportAggregateID?: string;

  @IsString()
  @IsOptional()
  field?: string;

  @IsString()
  @IsOptional()
  groupBy?: string;

  @IsString()
  @IsOptional()
  printPosition?: string;

  @IsBoolean()
  @IsOptional()
  hasPageTotal?: boolean;

  @IsBoolean()
  @IsOptional()
  hasGrandTotal?: boolean;
}

export class UpsertReportDto {
  @IsString()
  @IsOptional()
  reportID?: string;

  @IsString()
  @IsOptional()
  reportGroupRef?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  direction?: string;

  @IsString()
  @IsOptional()
  paperSize?: string;

  @IsString()
  @IsOptional()
  paperOrientation?: string;

  @IsBoolean()
  @IsOptional()
  showInstitutionName?: boolean;

  @IsBoolean()
  @IsOptional()
  showDate?: boolean;

  @IsBoolean()
  @IsOptional()
  showRowNumber?: boolean;

  @IsBoolean()
  @IsOptional()
  showFilters?: boolean;

  @IsString()
  @IsOptional()
  pageNumberType?: string;

  @IsBoolean()
  @IsOptional()
  showLogo?: boolean;

  @IsBoolean()
  @IsOptional()
  hideDuplicates?: boolean;

  @IsString()
  @IsOptional()
  dataSourceType?: string;

  @IsString()
  @IsOptional()
  primaryTable?: string;

  @IsString()
  @IsOptional()
  targetForm?: string;

  @IsBoolean()
  @IsOptional()
  isDefaultTemplate?: boolean;

  @IsBoolean()
  @IsOptional()
  isSystemReport?: boolean;

  @IsString()
  @IsOptional()
  sqlScript?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportFieldDto)
  @IsOptional()
  fields?: ReportFieldDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportGroupingDto)
  @IsOptional()
  groupings?: ReportGroupingDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportFilterDto)
  @IsOptional()
  filters?: ReportFilterDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportSortingDto)
  @IsOptional()
  sortings?: ReportSortingDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportFormulaDto)
  @IsOptional()
  formulas?: ReportFormulaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportAggregateDto)
  @IsOptional()
  aggregates?: ReportAggregateDto[];
}

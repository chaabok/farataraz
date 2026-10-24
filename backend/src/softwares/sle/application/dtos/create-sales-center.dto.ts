import { IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateSalesCenterDto {
  @IsNumber()
  Code!: number;

  @IsNumber()
  Type!: number;

  @IsOptional()
  @IsNumber()
  ReferenceRef?: number;

  @IsString()
  Title!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  Title2?: string;

  @IsOptional()
  @IsString()
  title2?: string;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  BusinessStructureRef?: number;

  @IsOptional()
  @IsNumber()
  CompanyRef?: number;

  @IsOptional()
  @IsNumber()
  FiscalYearRef?: number;
}

export class UpdateSalesCenterDto extends PartialType(CreateSalesCenterDto) {}

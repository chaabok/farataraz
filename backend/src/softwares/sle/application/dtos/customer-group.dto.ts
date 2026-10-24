import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateCustomerGroupDto {
  @IsOptional()
  @IsNumber()
  CustomerGroupID?: number;

  @IsString()
  Code: string;

  @IsString()
  Title: string;

  @IsOptional()
  @IsString()
  Title2?: string;

  @IsOptional()
  @IsNumber()
  DetailedAccountRef?: number;

  @IsOptional()
  @IsString()
  detailedAccountCode?: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsBoolean()
  IsMandatory?: boolean;

  @IsOptional()
  @IsNumber()
  ParentRef?: number;

  @IsOptional()
  RelatedParties?: any[];

  @IsOptional()
  @IsNumber()
  CompanyRef?: number;

  @IsOptional()
  @IsNumber()
  BusinessStructureRef?: number;
}

export class UpdateCustomerGroupDto {
  @IsOptional()
  @IsString()
  Code?: string;

  @IsOptional()
  @IsString()
  Title?: string;

  @IsOptional()
  @IsString()
  Title2?: string;

  @IsOptional()
  @IsNumber()
  DetailedAccountRef?: number;

  @IsOptional()
  @IsString()
  detailedAccountCode?: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsBoolean()
  IsMandatory?: boolean;

  @IsOptional()
  @IsNumber()
  ParentRef?: number;

  @IsOptional()
  RelatedParties?: any[];
}

import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateItemServiceGroupFieldDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  @IsString()
  field_title?: string;

  @IsOptional()
  @IsString()
  field_title2?: string;

  @IsOptional()
  field_type?: any;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    return Boolean(value);
  })
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsString()
  options?: string;

  @IsOptional()
  RowNo?: any;
}

export class CreateItemServiceGroupRelatedProductDto {
  @IsOptional()
  @IsString()
  _id?: string;

  @IsOptional()
  @IsString()
  product_code?: string;

  @IsOptional()
  @IsString()
  product_name?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    return Boolean(value);
  })
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateItemServiceGroupDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  name2?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1' || value === 1) return true;
    if (value === 'false' || value === '0' || value === 0) return false;
    return Boolean(value);
  })
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  parentId?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemServiceGroupFieldDto)
  additionalFields?: CreateItemServiceGroupFieldDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemServiceGroupRelatedProductDto)
  relatedProducts?: CreateItemServiceGroupRelatedProductDto[];

  @IsOptional()
  companyRef?: number;

  @IsOptional()
  businessStructureRef?: number;
}

export class UpdateItemServiceGroupDto extends CreateItemServiceGroupDto {
  @IsOptional()
  id?: number | string;
}

export class SaveTreeDto {
  @IsOptional()
  treeData?: any;
}


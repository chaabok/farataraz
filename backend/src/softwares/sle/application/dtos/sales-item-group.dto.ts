import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject } from 'class-validator';

export class CreateSalesItemGroupDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  name2?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @IsOptional()
  @IsNumber()
  parentId?: number | null;

  @IsOptional()
  @IsArray()
  relatedProducts?: any[];

  @IsOptional() @IsNumber() companyRef?: number;
  @IsOptional() @IsNumber() businessStructureRef?: number;
}

export class UpdateSalesItemGroupDto extends CreateSalesItemGroupDto {}

export class SaveTreeDto {
  // The frontend sends the full tree as a single root node object (TreeNode),
  // not an array. @IsArray() rejected every save with HTTP 400.
  @IsObject()
  treeData: any;
}

import { BusinessStructureType } from '../../domain/entities/business-structure.enum';
import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class UpdateBusinessStructureDto {
  @IsOptional()
  @IsInt()
  parentRef?: number;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  title_en?: string;

  @IsOptional()
  @IsInt()
  businessStructure?: BusinessStructureType;

  @IsOptional()
  @IsString()
  businessStructureName?: string;

  @IsOptional()
  @IsString()
  manager?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isBasicInfoShared?: boolean;

  @IsOptional()
  @IsString()
  activeStructureTypes?: string;
}

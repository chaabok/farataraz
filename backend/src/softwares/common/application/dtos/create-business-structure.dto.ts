import { BusinessStructureType } from '../../domain/entities/business-structure.enum';
import { IsString, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class CreateBusinessStructureDto {
  @IsInt()
  parentRef: number;

  @IsString()
  code: string;

  @IsString()
  title: string;

  @IsString()
  title_en: string;

  @IsInt()
  businessStructure: BusinessStructureType;

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

import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CostCenterType } from '../../domain/entities/cost-center.enum';

export class CreateCostCenterDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  title_en?: string;

  @IsEnum(CostCenterType)
  @IsNotEmpty()
  @Type(() => Number)
  costCenterType: CostCenterType;

  @IsString()
  @IsNotEmpty()
  detailedAccountCode: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}

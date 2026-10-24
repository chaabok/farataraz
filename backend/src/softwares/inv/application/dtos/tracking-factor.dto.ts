import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class RelatedItemDto {
  @IsNumber()
  ItemRef: number;
}

export class ConstantValueDto {
  @IsOptional()
  @IsNumber()
  RowNumber?: number;

  @IsString()
  ConstantValue: string;
}

export class CreateTrackingFactorDto {
  @IsOptional()
  @IsNumber()
  TrackingFactorCode?: number;

  @IsString()
  TrackingFactorName: string;

  @IsOptional()
  @IsString()
  TrackingFactorName2?: string;

  @IsOptional()
  @IsNumber()
  TrackingFactorType?: number;

  @IsOptional()
  @IsString()
  StartValue?: string;

  @IsOptional()
  @IsString()
  EndValue?: string;

  @IsOptional()
  @IsBoolean()
  IsConstantValue?: boolean;

  @IsOptional()
  @IsNumber()
  DisplayPriority?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  relatedItemIds?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedItemDto)
  relatedItems?: RelatedItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConstantValueDto)
  constantValues?: ConstantValueDto[];
}

export class UpdateTrackingFactorDto {
  @IsOptional()
  @IsNumber()
  TrackingFactorCode?: number;

  @IsOptional()
  @IsString()
  TrackingFactorName?: string;

  @IsOptional()
  @IsString()
  TrackingFactorName2?: string;

  @IsOptional()
  @IsNumber()
  TrackingFactorType?: number;

  @IsOptional()
  @IsString()
  StartValue?: string;

  @IsOptional()
  @IsString()
  EndValue?: string;

  @IsOptional()
  @IsBoolean()
  IsConstantValue?: boolean;

  @IsOptional()
  @IsNumber()
  DisplayPriority?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  relatedItemIds?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RelatedItemDto)
  relatedItems?: RelatedItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConstantValueDto)
  constantValues?: ConstantValueDto[];
}


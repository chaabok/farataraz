import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateItemPackageDetailDto {
  @IsOptional()
  @IsNumber()
  ItemPackageDetailID?: number;

  @IsOptional()
  @IsNumber()
  RowNo?: number;

  @IsNotEmpty({ message: 'انتخاب کالا یا خدمت الزامی است' })
  @IsNumber()
  ItemRef: number;

  @IsOptional()
  @IsNumber()
  MeasurementUnitRef?: number;

  @IsOptional()
  @IsNumber()
  Quantity?: number;

  @IsOptional()
  @IsString()
  Description?: string;
}

export class CreateItemPackageDto {
  @IsNotEmpty({ message: 'نوع (کالا یا خدمت) الزامی است' })
  @IsNumber()
  ItemType: number;

  @IsOptional()
  @IsString()
  PackageCode?: string;

  @IsNotEmpty({ message: 'عنوان پک الزامی است' })
  @IsString()
  PackageTitle: string;

  @IsOptional()
  @IsString()
  PackageTitle2?: string;

  @IsOptional()
  @IsNumber()
  MeasurementUnitRef?: number;

  @IsOptional()
  @IsNumber()
  Quantity?: number;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemPackageDetailDto)
  items?: CreateItemPackageDetailDto[];
}

export class UpdateItemPackageDto extends PartialType(CreateItemPackageDto) {}

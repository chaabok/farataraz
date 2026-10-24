import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

function TransformToNumber({ value }: { value: any }) {
  if (value === '' || value === null || value === undefined) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}

export class WarehouseProductDto {
  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseProductID?: number;

  @IsOptional()
  @IsString()
  ProductCode?: string;

  @IsOptional()
  @IsString()
  ProductTitle?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  MeasurementUnitRef?: number;
}

export class WarehouseUserDto {
  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseUserID?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  UserRef?: number;
}

export class WarehouseAddressDto {
  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseAddressID?: number;

  @IsOptional()
  @IsString()
  AddressState?: string;

  @IsOptional()
  @IsString()
  AddressCity?: string;

  @IsOptional()
  @IsString()
  AddressTitle?: string;

  @IsOptional()
  @IsString()
  AddressTitle2?: string;

  @IsOptional()
  @IsString()
  PostalCode?: string;

  @IsOptional()
  @IsString()
  Longitude?: string;

  @IsOptional()
  @IsString()
  Latitude?: string;
}

export class WarehouseKeeperDto {
  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseKeeperID?: number;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseKeeperRef?: number;

  @IsOptional()
  @IsString()
  Address?: string;

  @IsOptional()
  @IsString()
  MobilePhone?: string;

  @IsOptional()
  @IsString()
  Phone?: string;
}

export class CreateWarehouseDto {
  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseType?: number;

  @IsOptional()
  @IsString()
  WarehouseCode?: string;

  @IsOptional()
  @IsString()
  WarehouseTitle?: string;

  @IsOptional()
  @IsString()
  WarehouseTitle2?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseNature?: number;

  @IsOptional()
  @IsString()
  Phone?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  DetailedAccountRef?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  ParentRef?: number;

  @IsOptional()
  @IsString()
  AddressState?: string;

  @IsOptional()
  @IsString()
  AddressCity?: string;

  @IsOptional()
  @IsString()
  AddressTitle?: string;

  @IsOptional()
  @IsString()
  AddressTitle2?: string;

  @IsOptional()
  @IsString()
  PostalCode?: string;

  @IsOptional()
  @IsString()
  Longitude?: string;

  @IsOptional()
  @IsString()
  Latitude?: string;

  @IsOptional()
  @Transform(TransformToNumber)
  @Type(() => Number)
  @IsNumber()
  WarehouseKeeperRef?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseProductDto)
  WarehouseProducts?: WarehouseProductDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseUserDto)
  WarehouseUsers?: WarehouseUserDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseAddressDto)
  WarehouseAddresses?: WarehouseAddressDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WarehouseKeeperDto)
  WarehouseKeepers?: WarehouseKeeperDto[];
}

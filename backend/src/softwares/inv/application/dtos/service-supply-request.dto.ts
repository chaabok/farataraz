import { IsOptional, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceSupplyRequestDetailDto {
  @IsOptional()
  ItemRef?: number;

  @IsOptional()
  RequestQuantity?: number;

  @IsOptional()
  ApprovedQuantity?: number;

  @IsOptional()
  DeliveryDate?: string;

  @IsOptional()
  Description?: string;
}

export class CreateServiceSupplyRequestDto {
  @IsOptional()
  BasisType?: number;

  @IsOptional()
  BaseSource?: number;

  @IsOptional()
  RequestNumber?: number;

  @IsOptional()
  RequestDate?: string;

  @IsOptional()
  RequestType?: number;

  @IsOptional()
  Priority?: number;

  @IsOptional()
  Status?: number;

  @IsOptional()
  Requester?: string;

  @IsOptional()
  RequesterRef?: number;

  @IsOptional()
  WarehouseRef?: number;

  @IsOptional()
  Description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceSupplyRequestDetailDto)
  details?: CreateServiceSupplyRequestDetailDto[];
}

export class UpdateServiceSupplyRequestDto extends CreateServiceSupplyRequestDto {}

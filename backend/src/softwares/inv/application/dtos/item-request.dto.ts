import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemRequestDetailDto {
  @IsOptional()
  RowNo?: number;

  @IsOptional()
  ItemRef?: any;

  @IsOptional()
  RequestQuantity?: any;

  @IsOptional()
  ApprovedQuantity?: any;

  @IsOptional()
  @IsString()
  DeliveryDate?: string;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  trackingFactorValues?: any;

  @IsOptional()
  TrackingFactorValues?: any;
}

export class CreateItemRequestDto {
  @IsOptional()
  BasisType?: any;

  @IsOptional()
  RequestNumber?: any;

  @IsOptional()
  RequestDate?: any;

  @IsOptional()
  RequestType?: any;

  @IsOptional()
  Priority?: any;

  @IsOptional()
  Status?: any;

  @IsOptional()
  Requester?: any;

  @IsOptional()
  RequesterRef?: any;

  @IsOptional()
  WarehouseRef?: any;

  @IsOptional()
  Description?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemRequestDetailDto)
  details?: CreateItemRequestDetailDto[];
}

export class UpdateItemRequestDto extends CreateItemRequestDto {}


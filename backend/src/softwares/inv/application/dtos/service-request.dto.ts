import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceRequestDetailDto {
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
}

export class CreateServiceRequestDto {
  @IsOptional()
  BaseSource?: any;

  @IsOptional()
  RequestNumber?: any;

  @IsOptional()
  RequestDate?: any;

  @IsOptional()
  Priority?: any;

  @IsOptional()
  Status?: any;

  @IsOptional()
  Requester?: any;

  @IsOptional()
  RequesterRef?: any;

  @IsOptional()
  Description?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceRequestDetailDto)
  details?: CreateServiceRequestDetailDto[];
}

export class UpdateServiceRequestDto extends CreateServiceRequestDto {}


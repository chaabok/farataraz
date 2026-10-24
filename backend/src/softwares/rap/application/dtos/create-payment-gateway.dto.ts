import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, ValidateNested, IsArray, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentGatewayType } from '../../domain/entities/payment-gateway-type.enum';

export class PaymentGatewayContactDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  title2?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreatePaymentGatewayDto {
  @IsEnum(PaymentGatewayType)
  gatewayType: PaymentGatewayType;

  @IsNumber()
  partiesRef: number;

  @IsString()
  @IsOptional()
  detailedAccountCode?: string;

  @IsNumber()
  bankAccountRef: number;

  @IsString()
  @IsOptional()
  gatewayIdString?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  companyRef?: number;

  @IsNumber()
  @IsOptional()
  businessStructureRef?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PaymentGatewayContactDto)
  contacts?: PaymentGatewayContactDto[];
}

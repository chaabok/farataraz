import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateCustomerDto {
  @IsOptional()
  @IsNumber()
  CustomerID?: number;

  @IsOptional()
  @IsString()
  Code?: string;

  @IsOptional()
  @IsNumber()
  CustomerType?: number;

  @IsOptional()
  @IsNumber()
  PartyRef?: number;

  @IsOptional()
  @IsNumber()
  CustomerGroupRef?: number;

  @IsOptional()
  SalesChannels?: any;

  @IsOptional()
  @IsNumber()
  SalesStatus?: number;

  @IsOptional()
  @IsNumber()
  SalesIntermediaryRef?: number;

  @IsOptional()
  SalesTypes?: any;

  @IsOptional()
  @IsNumber()
  CurrencyRef?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  PartyAddresses?: any[];

  @IsOptional()
  partyAddresses?: any[];

  @IsOptional()
  PartyPhones?: any[];

  @IsOptional()
  partyPhones?: any[];
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  Code?: string;

  @IsOptional()
  @IsNumber()
  CustomerType?: number;

  @IsOptional()
  @IsNumber()
  PartyRef?: number;

  @IsOptional()
  @IsNumber()
  CustomerGroupRef?: number;

  @IsOptional()
  SalesChannels?: any;

  @IsOptional()
  @IsNumber()
  SalesStatus?: number;

  @IsOptional()
  @IsNumber()
  SalesIntermediaryRef?: number;

  @IsOptional()
  SalesTypes?: any;

  @IsOptional()
  @IsNumber()
  CurrencyRef?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  PartyAddresses?: any[];

  @IsOptional()
  partyAddresses?: any[];

  @IsOptional()
  PartyPhones?: any[];

  @IsOptional()
  partyPhones?: any[];
}

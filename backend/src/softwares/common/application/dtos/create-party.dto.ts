import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePartyDto {
  @IsString()
  nature: string; // 'real_person' | 'legal_entity'

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  subType?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  latinFirstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  latinLastName?: string;

  @IsOptional()
  @IsString()
  economicCode?: string;

  @IsOptional()
  @IsString()
  nationalCode?: string;

  @IsOptional()
  @IsString()
  passportNumber?: string;

  @IsOptional()
  @IsString()
  birthDate?: string | Date;

  @IsOptional()
  @IsString()
  marriageDate?: string | Date;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsBoolean()
  isSupplier?: boolean;

  @IsOptional()
  @IsString()
  balance?: string;

  @IsOptional()
  @IsString()
  balanceStatus?: string;

  @IsOptional()
  @IsBoolean()
  isCustomer?: boolean;

  @IsOptional()
  @IsString()
  customerBalance?: string;

  @IsOptional()
  @IsString()
  customerBalanceStatus?: string;

  @IsOptional()
  @IsBoolean()
  isSalesIntermediary?: boolean;

  @IsOptional()
  @IsString()
  salesIntermediaryBalance?: string;

  @IsOptional()
  @IsString()
  salesIntermediaryBalanceStatus?: string;

  @IsOptional()
  PartyRelatedPersons?: any[];

  @IsOptional()
  partyRelatedPersons?: any[];

  @IsOptional()
  PartyAddresses?: any[];

  @IsOptional()
  partyAddresses?: any[];

  @IsOptional()
  PartyPhones?: any[];

  @IsOptional()
  partyPhones?: any[];
}

import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBankAccountDto {
  @IsOptional()
  @IsNumber()
  bankAccountId?: number;

  @IsNotEmpty()
  @IsNumber()
  bankBranchRef: number;

  @IsNotEmpty()
  @IsNumber()
  bankAccountTypeRef: number;

  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  latinTitle?: string;

  @IsOptional()
  @IsString()
  shabaNumber?: string;

  @IsOptional()
  @IsNumber()
  detailedCode?: number;

  @IsOptional()
  @IsNumber()
  accountRef?: number;

  @IsOptional()
  @IsNumber()
  currencyRef?: number;

  @IsOptional()
  @IsNumber()
  initialBalance?: number;

  @IsOptional()
  @IsString()
  openingDate?: string | Date;

  @IsOptional()
  @IsString()
  accountHolderName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

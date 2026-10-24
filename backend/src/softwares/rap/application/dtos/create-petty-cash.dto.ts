import { IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePettyCashDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsOptional()
  @IsString()
  openingDate?: string;

  @IsNumber()
  @IsOptional()
  initialBalance?: number;

  @IsNumber()
  @IsOptional()
  pettyCashLimit?: number;

  @IsNumber()
  @IsOptional()
  currentBalance?: number;

  @IsNumber()
  @IsOptional()
  accountRef?: number;

  @IsNumber()
  @IsOptional()
  partyRef?: number;

  @IsBoolean()
  @IsOptional()
  isPettyCashLimitControlled?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

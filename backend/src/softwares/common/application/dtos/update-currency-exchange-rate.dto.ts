import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCurrencyExchangeRateDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  baseCurrencyRef?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  targetCurrencyRef?: number;

  @IsOptional()
  @IsString()
  effectiveDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  exchangeRate?: number;
}

import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCurrencyExchangeRateDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  baseCurrencyRef: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  targetCurrencyRef: number;

  @IsNotEmpty()
  @IsString()
  effectiveDate: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  exchangeRate: number;
}

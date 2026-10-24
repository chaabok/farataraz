import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCurrencyDto {
  @IsInt()
  @IsOptional() // Handled by service if not provided
  code?: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @IsInt()
  @IsNotEmpty()
  exchangeUnit: number;

  @IsInt()
  @IsNotEmpty()
  precisionCount: number;

  @IsString()
  @IsOptional()
  precisionTitle?: string;

  @IsString()
  @IsOptional()
  precisionTitleEn?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

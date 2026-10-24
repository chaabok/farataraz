import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray, MaxLength } from 'class-validator';

export class CreateCashDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  title_en?: string;

  @IsNumber()
  @IsOptional()
  cashTypeId?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  detailedAccountCode: string;

  @IsNumber()
  @IsNotEmpty()
  currencyId: number;

  @IsNumber()
  @IsOptional()
  initialBalance?: number;

  @IsOptional()
  openingDate?: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true })
  cashiers?: number[]; // User IDs
}

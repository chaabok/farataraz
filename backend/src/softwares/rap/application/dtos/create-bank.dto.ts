import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';
import { BankType } from '../../domain/entities/bank-type.enum';

export class CreateBankDto {
  @IsNumber()
  @IsNotEmpty()
  code: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  latinTitle?: string;

  @IsNumber()
  @IsNotEmpty()
  bankType: BankType;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  swiftCode?: string;

  @IsNumber()
  @IsOptional()
  nationalityRef?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  website?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

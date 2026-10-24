import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBankAccountTypeDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  bankAccountTypeId?: number;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  code: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  latinTitle?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

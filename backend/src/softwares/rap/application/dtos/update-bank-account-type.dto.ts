import { IsString, IsNumber, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBankAccountTypeDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  code?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  latinTitle?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

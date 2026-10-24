import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength, IsNumber } from 'class-validator';

export class CreateDetailedAccountDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  title_en?: string;

  @IsNumber()
  @IsOptional()
  detailedTypesId?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

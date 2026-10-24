import { IsNotEmpty, IsString, IsOptional, IsBoolean, MaxLength, IsNumber } from 'class-validator';

export class CreateOtherDetailsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  title_en?: string;

  @IsOptional()
  @IsNumber()
  detailedCode?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

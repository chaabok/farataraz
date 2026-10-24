import { IsString, IsOptional, IsBoolean, MaxLength, IsInt } from 'class-validator';

export class UpdateVoucherTypeDto {
  @IsInt()
  @IsOptional()
  code?: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  title_en?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

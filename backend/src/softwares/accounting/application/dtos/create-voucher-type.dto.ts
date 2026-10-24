import { IsString, IsOptional, IsBoolean, MaxLength, IsInt } from 'class-validator';

export class CreateVoucherTypeDto {
  @IsInt()
  code: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  title_en?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

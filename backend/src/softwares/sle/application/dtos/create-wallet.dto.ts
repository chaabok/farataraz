import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateWalletDto {
  @IsOptional()
  @IsNumber()
  WalletID?: number;

  @IsNumber()
  Code: number;

  @IsString()
  Title: string;

  @IsOptional()
  @IsString()
  Title2?: string;

  @IsNumber()
  Nature: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsNumber()
  CompanyRef?: number;

  @IsOptional()
  @IsNumber()
  BusinessStructureRef?: number;
}

export class UpdateWalletDto {
  @IsOptional()
  @IsNumber()
  Code?: number;

  @IsOptional()
  @IsString()
  Title?: string;

  @IsOptional()
  @IsString()
  Title2?: string;

  @IsOptional()
  @IsNumber()
  Nature?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Description?: string;
}

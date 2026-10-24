import { IsString, IsNotEmpty, IsOptional, IsNumber, MaxLength } from 'class-validator';

export class CreateBankBranchDto {
  @IsNumber()
  @IsNotEmpty()
  bankId: number;

  @IsNumber()
  @IsOptional()
  branchCode?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  latinTitle?: string;

  @IsNumber()
  @IsOptional()
  cityRef?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  contactName?: string;
}

import { IsOptional, IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReconcileBankStatementItemDto {
  @IsOptional() @IsString() documentNumber?: string;
  @IsOptional() @IsString() documentDate?: string;
  @IsOptional() @IsNumber() debit?: number;
  @IsOptional() @IsNumber() credit?: number;
  @IsOptional() @IsString() description?: string;
}

export class CreateReconcileBankStatementDto {
  @IsOptional() @IsNumber() BankAccountRef?: number;
  @IsOptional() @IsString() Number?: string;
  @IsOptional() @IsString() Date?: string;
  @IsOptional() @IsString() fromDate?: string;
  @IsOptional() @IsNumber() previousBalance?: number;
  @IsOptional() @IsNumber() balance?: number;
  @IsOptional() @IsNumber() fiscalYearRef?: number;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReconcileBankStatementItemDto)
  items?: CreateReconcileBankStatementItemDto[];
}

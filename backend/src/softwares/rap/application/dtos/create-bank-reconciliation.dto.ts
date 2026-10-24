import { IsOptional, IsString, IsNumber, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBankReconciliationItemDto {
  @IsOptional()
  @IsNumber()
  BankStatementItemRef?: number;

  @IsOptional()
  @IsString()
  BookItemRef?: string;

  @IsOptional()
  @IsString()
  matchId?: string;
}

export class CreateBankReconciliationDto {
  @IsOptional()
  @IsNumber()
  BankAccountRef?: number;

  @IsOptional()
  @IsNumber()
  ReconcileBankStatementRef?: number;

  @IsOptional()
  @IsString()
  Number?: string;

  @IsOptional()
  @IsString()
  Date?: string;

  @IsOptional()
  @IsBoolean()
  isOpening?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBankReconciliationItemDto)
  items?: CreateBankReconciliationItemDto[];
}

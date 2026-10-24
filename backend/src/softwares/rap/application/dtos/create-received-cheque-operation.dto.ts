import { IsNumber, IsString, IsOptional, ValidateNested, IsArray, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReceivedChequeOperationItemDto {
  @IsOptional()
  @IsNumber()
  receivedChequeOperationItemId?: number;

  @IsNumber()
  receiptChequeRef: number;

  @IsOptional()
  @IsNumber()
  chequeStatus?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  forecastDate?: string;

  @IsOptional()
  @IsNumber()
  cashRef?: number;
}

export class CreateReceivedChequeOperationDto {
  @IsNumber()
  operationType: number;

  @IsString()
  @MaxLength(50)
  documentNumber: string;

  @IsString()
  @MaxLength(20)
  documentDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  assignmentNumber?: string;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsNumber()
  bankAccountRef?: number;

  @IsOptional()
  @IsNumber()
  realizerRef?: number;

  @IsOptional()
  @IsNumber()
  voucherHeaderRef?: number;

  @IsOptional()
  @IsNumber()
  companyRef?: number;

  @IsOptional()
  @IsNumber()
  businessStructureRef?: number;

  @IsOptional()
  @IsNumber()
  fiscalYearRef?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceivedChequeOperationItemDto)
  items: CreateReceivedChequeOperationItemDto[];
}

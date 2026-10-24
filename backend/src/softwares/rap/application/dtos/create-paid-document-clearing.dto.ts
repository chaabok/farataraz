import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class PaidDocumentClearingItemDto {
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsNumber()
  documentId: number;
}

export class CreatePaidDocumentClearingDto {
  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  bankAccountRef: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaidDocumentClearingItemDto)
  items: PaidDocumentClearingItemDto[];

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
}

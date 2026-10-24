import { IsNumber, IsOptional, IsString, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PettyCashSummaryState } from '../../domain/entities/petty-cash-summary.enum';

export class CreatePettyCashSummaryItemDto {
  @IsNumber()
  @IsOptional()
  reasonRef?: number;

  @IsString()
  @IsOptional()
  paymentReceiptNumber?: string;

  @IsString()
  @IsOptional()
  paymentReceiptDate?: string | Date;

  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreatePettyCashSummaryDto {
  @IsNumber()
  pettyCashRef: number;

  @IsNumber()
  number: number;

  @IsString()
  date: string | Date;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  fiscalYearRef?: number;

  @IsNumber()
  @IsOptional()
  voucherHeaderRef?: number;

  @IsEnum(PettyCashSummaryState)
  @IsOptional()
  state?: PettyCashSummaryState;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePettyCashSummaryItemDto)
  @IsOptional()
  items?: CreatePettyCashSummaryItemDto[];
}

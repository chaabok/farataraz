import { IsNotEmpty, IsNumber, IsDate, IsString, IsOptional, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { toEnglishDigits, parseDateString } from '../../../../core/utils/date-parser';

export { toEnglishDigits, parseDateString };

export class CreateVoucherItemDto {
  @IsOptional()
  @IsNumber()
  voucherItemId?: number;

  @IsNotEmpty()
  @IsNumber()
  rowNumber: number;

  @IsNotEmpty()
  @IsNumber()
  accountId: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId1?: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId2?: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId3?: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId4?: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId5?: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId6?: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId7?: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId8?: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId9?: number;

  @IsOptional()
  @IsNumber()
  detailedAccountId10?: number;

  @IsNotEmpty()
  @IsNumber()
  debit: number;

  @IsNotEmpty()
  @IsNumber()
  credit: number;

  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsNumber()
  currencyId?: number;

  @IsOptional()
  @IsNumber()
  currencyAmount?: number;

  @IsOptional()
  @IsNumber()
  exchangeRate?: number;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @Transform(parseDateString)
  @IsDate()
  trackingDate?: Date;

  @IsOptional()
  @IsBoolean()
  isSystemGenerated?: boolean;
}

export class CreateVoucherDto {
  @IsOptional()
  @IsNumber()
  voucherTypeId?: number;

  @IsNotEmpty()
  @IsNumber()
  voucherNumber: number;

  @IsNotEmpty()
  @Transform(parseDateString)
  @IsDate()
  voucherDate: Date;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  subNumber?: string;

  @IsOptional()
  @IsString()
  voucherNature?: string;

  @IsOptional()
  @IsString()
  description2?: string;

  @IsOptional()
  @Transform(parseDateString)
  @IsDate()
  sourceDocDate?: Date;

  @IsOptional()
  @IsNumber()
  dailyNumber?: number;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVoucherItemDto)
  items?: CreateVoucherItemDto[];
}

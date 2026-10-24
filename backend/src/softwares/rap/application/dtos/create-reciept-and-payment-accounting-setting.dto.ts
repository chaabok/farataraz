import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { UsedEntryType, RapOperationType, RapDetailedType, TermType } from '../../domain/entities/reciept-and-payment-accounting-setting.enum';

export class CreateRecieptAndPaymentAccountingSettingDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  title_en?: string;

  @IsNumber()
  @IsOptional()
  accountRef?: number | null;

  @IsEnum(UsedEntryType)
  @IsOptional()
  @Type(() => Number)
  usedEntryType?: UsedEntryType;

  @IsEnum(RapOperationType)
  @IsOptional()
  @Type(() => Number)
  operationType?: RapOperationType;

  @IsEnum(RapDetailedType)
  @IsOptional()
  @Type(() => Number)
  detailedType?: RapDetailedType;

  @IsEnum(TermType)
  @IsOptional()
  @Type(() => Number)
  termType?: TermType;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

import { IsString, IsNotEmpty, IsBoolean, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { parseToIsoDateString } from '../../../../core/utils/date-parser';

export class CreateFiscalYearDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  title: string;

  @IsNotEmpty()
  @Transform(parseToIsoDateString)
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @Transform(parseToIsoDateString)
  @IsString()
  endDate: string;

  @IsBoolean()
  isActive: boolean;
}

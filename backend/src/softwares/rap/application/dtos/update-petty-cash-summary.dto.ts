import { PartialType } from '@nestjs/mapped-types';
import { CreatePettyCashSummaryDto } from './create-petty-cash-summary.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdatePettyCashSummaryDto extends PartialType(CreatePettyCashSummaryDto) {
  @IsOptional()
  @IsNumber()
  pettyCashSummaryId?: number;
}

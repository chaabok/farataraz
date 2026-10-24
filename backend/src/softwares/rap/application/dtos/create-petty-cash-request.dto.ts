import { IsNumber, IsOptional, IsString, IsInt } from 'class-validator';

export class CreatePettyCashRequestDto {
  @IsNumber()
  pettyCashRef: number;

  @IsString()
  requestNumber: string;

  @IsString()
  requestDate: string | Date;

  @IsInt()
  basis: number;

  @IsNumber()
  @IsOptional()
  pettyCashSummaryRef?: number;

  @IsInt()
  @IsOptional()
  status?: number;

  @IsNumber()
  requestedAmount: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  fiscalYearRef?: number;
}

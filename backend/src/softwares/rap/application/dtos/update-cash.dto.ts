import { CreateCashDto } from './create-cash.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCashDto extends CreateCashDto {
  @IsNumber()
  @IsOptional()
  cashId?: number;
}

import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PromissoryNoteItemDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  promissoryNoteNumber: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  value: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  status: number;
}

export class CreatePromissoryNoteDto {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  cashRef: number;

  @IsString()
  @IsOptional()
  series: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  leafCount: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  startSerial: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  valueEach: number;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromissoryNoteItemDto)
  @IsOptional()
  items: PromissoryNoteItemDto[];
}

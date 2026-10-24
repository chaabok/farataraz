import { IsOptional, IsNumber, IsBoolean, IsString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class ChequebookItemDto {
  @IsOptional() @IsNumber() chequebookItemId?: number;
  @IsOptional() @IsNumber() chequebookRef?: number;
  @IsNotEmpty() @IsNumber() checkNumber: number;
  @IsOptional() @IsString() receiver?: string;
  @IsOptional() @IsString() issueDate?: string;
  @IsOptional() @IsNumber() amount?: number;
  @IsNotEmpty() @IsNumber() status: number;
}

export class CreateChequebookDto {
  @IsNotEmpty() @IsNumber() bankAccountRef: number;
  @IsOptional() @IsString() series?: string;
  @IsNotEmpty() @IsNumber() leafCount: number;
  @IsNotEmpty() @IsNumber() startSerial: number;
  @IsOptional() @IsBoolean() isActive?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChequebookItemDto)
  items?: ChequebookItemDto[];
}

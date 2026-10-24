import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateSettlementMethodDto {
  @IsOptional()
  SettlementMethodID?: number;

  @IsNumber()
  Code: number;

  @IsString()
  @IsNotEmpty({ message: 'فیلد عنوان اجباری است.' })
  Title: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  TITLE?: string;

  @IsOptional()
  @IsString()
  Title2?: string;

  @IsOptional()
  @IsString()
  title2?: string;

  @IsOptional()
  @IsString()
  TITLE2?: string;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Description?: string;
}

export class UpdateSettlementMethodDto {
  @IsOptional()
  @IsNumber()
  Code?: number;

  @IsOptional()
  @IsString()
  Title?: string;

  @IsOptional()
  @IsString()
  Title2?: string;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Description?: string;
}

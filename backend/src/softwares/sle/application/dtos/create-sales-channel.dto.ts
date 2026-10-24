import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateSalesChannelDto {
  @IsOptional()
  SalesChannelID?: number;

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

  @IsNumber()
  Type: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Description?: string;
}

export class UpdateSalesChannelDto {
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
  @IsNumber()
  Type?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsString()
  Description?: string;
}

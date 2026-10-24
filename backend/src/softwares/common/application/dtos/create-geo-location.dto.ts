import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { GeographicType } from '../../domain/entities/geographic-type.enum';

export class CreateGeoLocationDto {
  @IsNumber()
  @IsOptional()
  parentRef?: number;

  @IsEnum(GeographicType)
  geographicType: GeographicType;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  titleEn: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

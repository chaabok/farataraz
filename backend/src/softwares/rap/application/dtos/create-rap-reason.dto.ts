import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { RapReasonNature } from '../../domain/entities/rap-reason.entity';

export class CreateRapReasonDto {
  @IsOptional()
  @IsString()
  Code?: string;

  @IsNotEmpty()
  @IsString()
  Title: string;

  @IsOptional()
  @IsString()
  Title_En?: string;

  @IsOptional()
  @IsNumber()
  AccountRef?: number | null;

  @IsOptional()
  @IsEnum(RapReasonNature)
  Nature?: RapReasonNature;

  @IsOptional()
  @IsString()
  Description?: string;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsNumber()
  ParentRef?: number | null;
}

import { IsString, IsOptional } from 'class-validator';

export class UpsertReportGroupDto {
  @IsString()
  @IsOptional()
  reportGroupID?: string;

  @IsString()
  @IsOptional()
  title?: string;
}

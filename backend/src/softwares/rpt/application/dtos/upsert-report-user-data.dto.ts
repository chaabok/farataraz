import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReportUserDataItem {
  @IsString()
  dynamicKey: string;

  @IsString()
  value: string;
}

export class UpsertReportUserDataDto {
  @IsString()
  reportName: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReportUserDataItem)
  data: ReportUserDataItem[];
}


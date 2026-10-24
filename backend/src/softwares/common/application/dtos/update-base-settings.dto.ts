import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class SettingItemDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @Transform(({ value }) => (value !== null && value !== undefined ? String(value) : ''))
  @IsString()
  value: string;
}

export class UpdateBaseSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SettingItemDto)
  settings: SettingItemDto[];
}

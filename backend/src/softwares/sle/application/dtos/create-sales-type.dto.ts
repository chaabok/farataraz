import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateSalesTypeDto {
  @IsOptional()
  SalesTypeID?: number;

  @IsOptional()
  Code?: number;

  @IsString({ message: 'عنوان الزامی است' })
  @IsNotEmpty({ message: 'عنوان نمی‌تواند خالی باشد' })
  Title!: string;

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

export class UpdateSalesTypeDto extends CreateSalesTypeDto {}

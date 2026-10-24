import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class CreateItemAccountCategoryDto {
  @IsOptional()
  @IsNumber()
  ItemAccountCategoryCode?: number;

  @IsNotEmpty({ message: 'عنوان طبقه حساب کالا اجباری است' })
  @IsString()
  ItemAccountCategoryName: string;

  @IsNotEmpty({ message: 'عنوان دوم طبقه حساب کالا اجباری است' })
  @IsString()
  ItemAccountCategoryName2: string;

  @IsOptional()
  @IsNumber()
  PricingMethod?: number;

  @IsOptional()
  @IsNumber()
  StandardRate?: number;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  @IsNumber()
  InventorySlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  IndividualPurchaseSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  CorporatePurchaseSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  FreightSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  SuspensePurchaseSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  ForeignPurchaseSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  ScrapExpenseSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  ConsignmentOursSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  ConsignmentOthersSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  ConsignmentOffsetSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  IndividualPrepaymentSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  CorporatePrepaymentSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  ScrapIncomeSlAccountRef?: number;

  @IsOptional()
  @IsNumber()
  companyRef?: number;

  @IsOptional()
  @IsNumber()
  businessStructureRef?: number;
}

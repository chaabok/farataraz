import { IsOptional, IsString, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateSalesItemGroupDto {
  @IsOptional()
  @IsNumber()
  SalesItemGroupCode?: number;

  @IsOptional()
  @IsString()
  SalesItemGroupName?: string;

  @IsOptional()
  @IsString()
  SalesItemGroupName2?: string;

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
  @IsArray()
  Items?: any[];

  @IsOptional()
  @IsNumber()
  companyRef?: number;

  @IsOptional()
  @IsNumber()
  businessStructureRef?: number;

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
}

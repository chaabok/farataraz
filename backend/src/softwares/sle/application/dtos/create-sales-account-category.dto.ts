import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateSalesAccountCategoryDto {
  @IsOptional()
  @IsNumber()
  SalesAccountCategoryCode?: number;

  @IsString()
  SalesAccountCategoryName: string;

  @IsOptional()
  @IsString()
  SalesAccountCategoryName2?: string;

  @IsOptional()
  @IsBoolean()
  IsActive?: boolean;

  @IsOptional()
  Items?: any[];

  @IsOptional() @IsNumber() InventorySlAccountRef?: number;
  @IsOptional() @IsNumber() IndividualPurchaseSlAccountRef?: number;
  @IsOptional() @IsNumber() CorporatePurchaseSlAccountRef?: number;
  @IsOptional() @IsNumber() FreightSlAccountRef?: number;
  @IsOptional() @IsNumber() SuspensePurchaseSlAccountRef?: number;
  @IsOptional() @IsNumber() ForeignPurchaseSlAccountRef?: number;
  @IsNumber() CurrencyRef: number;

  @IsOptional() @IsNumber() companyRef?: number;
  @IsOptional() @IsNumber() businessStructureRef?: number;
}

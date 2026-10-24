export class CreateWarehouseVouchersPricingDto {
  WarehouseVouchersPricingID?: number;
  PricingType?: number; // 1 = Receipt (رسید), 2 = Issue (حواله)
  WarehouseVoucherRef?: number;
  WarehouseVoucherDetailRef?: number;
  ItemRef?: number;
  UnitPrice?: number;
  Additions?: number;
  Deductions?: number;
  NetPrice?: number;
  Description?: string;
  businessStructureRef?: number;
  companyRef?: number;
  FiscalYearRef?: number;
}

export class UpdateWarehouseVouchersPricingDto {
  PricingType?: number;
  WarehouseVoucherRef?: number;
  WarehouseVoucherDetailRef?: number;
  ItemRef?: number;
  UnitPrice?: number;
  Additions?: number;
  Deductions?: number;
  NetPrice?: number;
  Description?: string;
}

export class CalculateWarehousePricingDto {
  WarehouseIds?: number[];
  ItemIds?: number[];
  ValuationMethod?: number; // 1 = Weighted Average, 2 = FIFO, 3 = LIFO, 5 = Specific Identification
  DocumentScope?: number;   // 1 = All Documents, 2 = Receipts Only, 3 = Issues Only
  StartDate?: string;
  EndDate?: string;
  IncludeZeroRates?: boolean;
  OverrideExistingPrices?: boolean;
}

export declare class CreateWarehouseVouchersPricingDto {
    WarehouseVouchersPricingID?: number;
    PricingType?: number;
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
export declare class UpdateWarehouseVouchersPricingDto {
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
export declare class CalculateWarehousePricingDto {
    WarehouseIds?: number[];
    ItemIds?: number[];
    ValuationMethod?: number;
    DocumentScope?: number;
    StartDate?: string;
    EndDate?: string;
    IncludeZeroRates?: boolean;
    OverrideExistingPrices?: boolean;
}

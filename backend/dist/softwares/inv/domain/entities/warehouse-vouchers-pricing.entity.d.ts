import { Item } from './item.entity';
export declare class WarehouseVouchersPricing {
    WarehouseVouchersPricingID: number;
    PricingType: number;
    WarehouseVoucherRef?: number;
    WarehouseVoucherDetailRef?: number;
    ItemRef?: number;
    item?: Item;
    UnitPrice: number;
    Additions: number;
    Deductions: number;
    NetPrice: number;
    Description?: string;
    businessStructureRef?: number;
    companyRef?: number;
    FiscalYearRef?: number;
    creator?: number;
    createTime?: string;
    lastModifier?: number;
    lastModificationTime?: string;
}

export declare class CreateSalesItemGroupDto {
    SalesItemGroupCode?: number;
    SalesItemGroupName?: string;
    SalesItemGroupName2?: string;
    PricingMethod?: number;
    StandardRate?: number;
    IsActive?: boolean;
    Items?: any[];
    companyRef?: number;
    businessStructureRef?: number;
    InventorySlAccountRef?: number;
    IndividualPurchaseSlAccountRef?: number;
    CorporatePurchaseSlAccountRef?: number;
    FreightSlAccountRef?: number;
    SuspensePurchaseSlAccountRef?: number;
    ForeignPurchaseSlAccountRef?: number;
    ScrapExpenseSlAccountRef?: number;
    ConsignmentOursSlAccountRef?: number;
    ConsignmentOthersSlAccountRef?: number;
    ConsignmentOffsetSlAccountRef?: number;
    IndividualPrepaymentSlAccountRef?: number;
    CorporatePrepaymentSlAccountRef?: number;
    ScrapIncomeSlAccountRef?: number;
}

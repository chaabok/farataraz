export declare class CreateItemAccountCategoryDto {
    ItemAccountCategoryCode?: number;
    ItemAccountCategoryName: string;
    ItemAccountCategoryName2: string;
    PricingMethod?: number;
    StandardRate?: number;
    IsActive?: boolean;
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
    companyRef?: number;
    businessStructureRef?: number;
}

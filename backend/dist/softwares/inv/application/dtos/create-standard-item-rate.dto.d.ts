export declare class StandardItemRateDetailDto {
    StandardItemRateDetailID?: number;
    ItemRef?: number;
    UnitRate?: number;
}
export declare class CreateStandardItemRateDto {
    ItemAccountCategoryRef?: number | null;
    EffectiveDate?: string;
    Description?: string;
    companyRef?: number;
    businessStructureRef?: number;
    FiscalYearRef?: number;
    details?: StandardItemRateDetailDto[];
}

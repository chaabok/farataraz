export declare class ParameterValueDto {
    PurchaseSalesParameterValueID?: number;
    RowNo?: number;
    StartDate?: string;
    EndDate?: string;
    ParameterValue?: number;
    Description?: string;
    ProductServiceRef?: number;
    ProductServiceCode?: string;
    ProductServiceName?: string;
    MeasurementUnitName?: string;
}
export declare class CreatePurchaseSalesParameterDto {
    IsProcurement?: boolean;
    IsWarehouse?: boolean;
    IsSales?: boolean;
    Title?: string;
    Title2?: string;
    CalculationPriority?: number;
    PrintPriority?: number;
    ParameterType?: number;
    CalculationMethod?: number;
    CalculationCondition?: number;
    RelationType?: number;
    OperationType?: number;
    AmountAllocationMethod?: number;
    CategoryOther?: number;
    HasAccountingVoucher?: boolean;
    SlAccountRef?: number;
    IsNonDefiniteAmount?: boolean;
    IsMandatory?: boolean;
    IsFactorValueEditableByUser?: boolean;
    IsActive?: boolean;
    Description?: string;
    companyRef?: number;
    businessStructureRef?: number;
    ParameterValues?: ParameterValueDto[];
}

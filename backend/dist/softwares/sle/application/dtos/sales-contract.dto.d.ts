export declare class SalesContractItemDto {
    RowNo?: number;
    ItemRef?: any;
    ItemCode?: any;
    ItemName?: any;
    UnitName?: any;
    Quantity?: any;
    UnitPrice?: any;
    TotalPrice?: any;
    Description?: any;
    trackingFactorValues?: any;
}
export declare class SalesContractFactorDto {
    RowNo?: any;
    FactorTitle?: any;
    FactorType?: any;
    Amount?: any;
    Description?: any;
}
export declare class CreateSalesContractDto {
    ContractNumber?: any;
    DocumentDate?: any;
    ContractDate?: any;
    CustomerRef?: any;
    CustomerName?: any;
    SalesTypeRef?: any;
    SalesCenterRef?: any;
    DeliveryLocationRef?: any;
    SettlementMethodRef?: any;
    Status?: any;
    ContractSubject?: any;
    BaseDocumentTypeRef?: any;
    BaseDocumentRef?: any;
    items?: SalesContractItemDto[];
    factors?: SalesContractFactorDto[];
}
export declare class UpdateSalesContractDto extends CreateSalesContractDto {
}

export declare class SalesPermissionItemDto {
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
export declare class SalesPermissionFactorDto {
    RowNo?: any;
    FactorTitle?: any;
    FactorType?: any;
    Amount?: any;
    Description?: any;
}
export declare class CreateSalesPermissionDto {
    PermissionNumber?: any;
    PermissionDate?: any;
    CustomerRef?: any;
    CustomerName?: any;
    SalesTypeRef?: any;
    SalesCenterRef?: any;
    DeliveryLocationRef?: any;
    SettlementMethodRef?: any;
    Status?: any;
    Description?: any;
    BaseDocumentTypeRef?: any;
    BaseDocumentRef?: any;
    items?: SalesPermissionItemDto[];
    factors?: SalesPermissionFactorDto[];
}
export declare class UpdateSalesPermissionDto extends CreateSalesPermissionDto {
}

export declare class SalesOrderItemDto {
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
export declare class SalesOrderFactorDto {
    RowNo?: any;
    FactorTitle?: any;
    FactorType?: any;
    Amount?: any;
    Description?: any;
}
export declare class CreateSalesOrderDto {
    OrderNumber?: any;
    OrderDate?: any;
    DeliveryDate?: any;
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
    items?: SalesOrderItemDto[];
    factors?: SalesOrderFactorDto[];
}
export declare class UpdateSalesOrderDto extends CreateSalesOrderDto {
}

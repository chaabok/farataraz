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
export declare class CreateSalesOrderDto {
    OrderNumber?: any;
    OrderDate?: any;
    DeliveryDate?: any;
    CustomerRef?: any;
    CustomerName?: any;
    SalesTypeRef?: any;
    DeliveryLocationRef?: any;
    SettlementMethodRef?: any;
    Status?: any;
    Description?: any;
    items?: SalesOrderItemDto[];
}
export declare class UpdateSalesOrderDto extends CreateSalesOrderDto {
}

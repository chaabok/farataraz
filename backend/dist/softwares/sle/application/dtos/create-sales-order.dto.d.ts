export declare class SalesOrderDetailDto {
    RowNo?: number;
    ItemRef?: any;
    UnitName?: string;
    UnitType?: any;
    Quantity?: number;
    UnitPrice?: number;
    Discount?: number;
    TotalPrice?: number;
    PriceAfterDiscount?: number;
    Additions?: number;
    VatTax?: number;
    Deductions?: number;
    NetPrice?: number;
    Description?: string;
    trackingFactorValues?: any;
    TrackingFactorValues?: any;
}
export declare class SalesOrderFactorDto {
    RowNo?: number;
    FactorTitle?: string;
    FactorType?: any;
    Amount?: any;
    PurchaseSalesParameterRef?: any;
    CategoryOther?: any;
    Description?: string;
}
export declare class CreateSalesOrderDto {
    SalesOrderID?: number;
    SalesOrderNumber?: any;
    SalesOrderDate?: any;
    CustomerRef?: any;
    CustomerName?: string;
    SalesTypeRef?: any;
    DeliveryLocationRef?: any;
    SettleMethodRef?: any;
    SettleMethodTitle?: string;
    Status?: any;
    CurrencyRef?: any;
    Description?: string;
    details?: SalesOrderDetailDto[];
    factors?: SalesOrderFactorDto[];
}
export declare class UpdateSalesOrderDto extends CreateSalesOrderDto {
}

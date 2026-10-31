export declare class SalesInvoiceItemDto {
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
export declare class SalesInvoiceFactorDto {
    RowNo?: any;
    FactorTitle?: any;
    FactorType?: any;
    Amount?: any;
    Description?: any;
}
export declare class CreateSalesInvoiceDto {
    InvoiceNumber?: any;
    InvoiceDate?: any;
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
    items?: SalesInvoiceItemDto[];
    factors?: SalesInvoiceFactorDto[];
}
export declare class UpdateSalesInvoiceDto extends CreateSalesInvoiceDto {
}

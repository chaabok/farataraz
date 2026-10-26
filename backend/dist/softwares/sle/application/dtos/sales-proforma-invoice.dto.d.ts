export declare class SalesProformaInvoiceItemDto {
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
export declare class SalesProformaInvoiceFactorDto {
    RowNo?: any;
    FactorTitle?: any;
    FactorType?: any;
    Amount?: any;
    Description?: any;
}
export declare class CreateSalesProformaInvoiceDto {
    ProformaNumber?: any;
    ProformaDate?: any;
    ValidityDate?: any;
    CustomerRef?: any;
    CustomerName?: any;
    SalesTypeRef?: any;
    SalesCenterRef?: any;
    DeliveryLocationRef?: any;
    SettlementMethodRef?: any;
    Status?: any;
    Description?: any;
    items?: SalesProformaInvoiceItemDto[];
    factors?: SalesProformaInvoiceFactorDto[];
}
export declare class UpdateSalesProformaInvoiceDto extends CreateSalesProformaInvoiceDto {
}

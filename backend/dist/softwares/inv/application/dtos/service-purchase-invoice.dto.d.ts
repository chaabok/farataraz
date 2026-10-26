export declare class ServicePurchaseInvoiceDetailDto {
    ServicePurchaseInvoiceDetailID?: number;
    RowNo?: number;
    ItemRef?: number;
    UnitType?: number;
    Quantity?: number;
    UnitPrice?: number;
    Discount?: number;
    Description?: string;
}
export declare class ServicePurchaseInvoiceFactorDto {
    ServicePurchaseInvoiceFactorID?: number;
    RowNo?: number;
    FactorTitle?: string;
    FactorType?: number;
    Amount?: number;
    Description?: string;
}
export declare class CreateServicePurchaseInvoiceDto {
    BaseType?: number;
    SupplyRequestRef?: number;
    SupplierRef?: number;
    SupplierName?: string;
    InvoiceNumber?: number;
    InvoiceDate?: string;
    BaseDocumentNumber?: string;
    Status?: number;
    CurrencyRef?: number;
    Description?: string;
    items?: any[];
    factors?: any[];
}
export declare class UpdateServicePurchaseInvoiceDto extends CreateServicePurchaseInvoiceDto {
}

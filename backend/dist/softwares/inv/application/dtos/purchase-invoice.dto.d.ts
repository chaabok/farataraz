export declare class PurchaseInvoiceDetailDto {
    PurchaseInvoiceDetailID?: number;
    RowNo?: number;
    ItemRef?: number;
    UnitType?: number;
    Quantity?: number;
    UnitPrice?: number;
    Discount?: number;
    Description?: string;
    trackingFactorValues?: any;
    TrackingFactorValues?: any;
}
export declare class PurchaseInvoiceFactorDto {
    PurchaseInvoiceFactorID?: number;
    RowNo?: number;
    FactorTitle?: string;
    FactorType?: number;
    Amount?: number;
    Description?: string;
}
export declare class CreatePurchaseInvoiceDto {
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
    details?: any[];
    factors?: any[];
}
export declare class UpdatePurchaseInvoiceDto extends CreatePurchaseInvoiceDto {
}

export declare class WarehouseReceiptDetailDto {
    RowNo?: number;
    ItemRef?: any;
    WarehouseRef?: any;
    BaseNumber?: string;
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
export declare class WarehouseReceiptFactorDto {
    RowNo?: number;
    FactorTitle?: string;
    FactorType?: any;
    Amount?: number;
    Description?: string;
}
export declare class CreateWarehouseReceiptDto {
    BaseType?: any;
    WarehouseDocumentTypeRef?: any;
    WarehouseRef?: any;
    WarehouseName?: string;
    TemporaryReceiptRef?: any;
    SupplyRequestRef?: any;
    PurchaseInvoiceRef?: any;
    SalesInvoiceRef?: any;
    SupplierRef?: any;
    SupplierName?: string;
    ReceiptNumber?: any;
    ReceiptDate?: any;
    BaseDocumentNumber?: string;
    Status?: any;
    CurrencyRef?: any;
    Description?: string;
    details?: WarehouseReceiptDetailDto[];
    factors?: WarehouseReceiptFactorDto[];
}
export declare class UpdateWarehouseReceiptDto extends CreateWarehouseReceiptDto {
}
export declare class PriceReceiptItemRequestDto {
    RowNo?: number;
    ItemRef?: any;
    ItemCode?: any;
    ItemName?: string;
    Quantity?: number;
    UnitPrice?: number;
}
export declare class PriceReceiptItemsDto {
    pricingMethod: 'standardRate' | 'lastPurchase' | 'lastConsumption';
    ReceiptDate?: any;
    WarehouseReceiptID?: number;
    items: PriceReceiptItemRequestDto[];
}

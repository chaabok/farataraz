export declare class TemporaryItemReceiptDetailDto {
    TemporaryItemReceiptDetailID?: number;
    RowNo?: number;
    ItemRef?: number;
    BaseNumber?: string;
    UnitName?: string;
    UnitType?: number;
    Quantity?: number;
    UnitPrice?: number;
    Discount?: number;
    Description?: string;
    trackingFactorValues?: any;
    trackingFactors?: any;
}
export declare class TemporaryItemReceiptFactorDto {
    TemporaryItemReceiptFactorID?: number;
    RowNo?: number;
    FactorTitle?: string;
    FactorType?: number;
    Amount?: number;
    Description?: string;
}
export declare class CreateTemporaryItemReceiptDto {
    Type?: number;
    BaseType?: number;
    SupplyRequestRef?: number;
    SupplierRef?: number;
    SupplierName?: string;
    ReceiptNumber?: number;
    ReceiptDate?: Date | string;
    BaseDocumentNumber?: string;
    Status?: number;
    CurrencyRef?: number;
    Description?: string;
    details?: TemporaryItemReceiptDetailDto[];
    factors?: TemporaryItemReceiptFactorDto[];
}
export declare class UpdateTemporaryItemReceiptDto extends CreateTemporaryItemReceiptDto {
}

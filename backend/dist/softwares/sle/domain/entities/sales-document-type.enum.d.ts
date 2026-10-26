export declare enum SalesDocumentType {
    SalesOrder = 1,
    SalesProformaInvoice = 2,
    SalesContract = 3,
    SalesPermit = 4,
    SalesInvoice = 5,
    SalesReturnPermit = 6,
    SalesReturnInvoice = 7
}
export declare const SALES_DOCUMENT_TYPE_LABELS: {
    value: number;
    label: string;
}[];
export declare function salesDocumentTypeLabel(value: number | string | null | undefined): string;
export declare function isValidSalesDocumentType(value: unknown): boolean;
export declare const BASE_DOCUMENT_EXTRA_TYPES: {
    value: number;
    label: string;
}[];
export declare const BASE_DOCUMENT_TYPE_LABELS: {
    value: number;
    label: string;
}[];
export declare function isValidBaseDocumentType(value: unknown): boolean;

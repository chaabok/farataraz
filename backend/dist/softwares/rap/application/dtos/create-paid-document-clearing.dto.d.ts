export declare class PaidDocumentClearingItemDto {
    documentType: string;
    documentId: number;
}
export declare class CreatePaidDocumentClearingDto {
    number: string;
    date: string;
    bankAccountRef: number;
    description?: string;
    status?: number;
    items: PaidDocumentClearingItemDto[];
    voucherHeaderRef?: number;
    companyRef?: number;
    businessStructureRef?: number;
    fiscalYearRef?: number;
}

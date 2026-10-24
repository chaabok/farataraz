export declare class CreateReceivedChequeOperationItemDto {
    receivedChequeOperationItemId?: number;
    receiptChequeRef: number;
    chequeStatus?: number;
    forecastDate?: string;
    cashRef?: number;
}
export declare class CreateReceivedChequeOperationDto {
    operationType: number;
    documentNumber: string;
    documentDate: string;
    assignmentNumber?: string;
    status?: number;
    bankAccountRef?: number;
    realizerRef?: number;
    voucherHeaderRef?: number;
    companyRef?: number;
    businessStructureRef?: number;
    fiscalYearRef?: number;
    items: CreateReceivedChequeOperationItemDto[];
}

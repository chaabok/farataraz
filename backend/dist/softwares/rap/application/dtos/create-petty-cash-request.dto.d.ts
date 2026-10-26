export declare class CreatePettyCashRequestDto {
    pettyCashRef: number;
    requestNumber: string;
    requestDate: string | Date;
    basis: number;
    pettyCashSummaryRef?: number;
    status?: number;
    requestedAmount: number;
    description?: string;
    fiscalYearRef?: number;
}

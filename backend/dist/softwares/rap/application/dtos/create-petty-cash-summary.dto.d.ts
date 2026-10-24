import { PettyCashSummaryState } from '../../domain/entities/petty-cash-summary.enum';
export declare class CreatePettyCashSummaryItemDto {
    reasonRef?: number;
    paymentReceiptNumber?: string;
    paymentReceiptDate?: string | Date;
    amount?: number;
    description?: string;
}
export declare class CreatePettyCashSummaryDto {
    pettyCashRef: number;
    number: number;
    date: string | Date;
    description?: string;
    fiscalYearRef?: number;
    voucherHeaderRef?: number;
    state?: PettyCashSummaryState;
    items?: CreatePettyCashSummaryItemDto[];
}

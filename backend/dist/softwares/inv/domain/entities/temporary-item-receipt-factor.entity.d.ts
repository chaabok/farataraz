import { TemporaryItemReceipt } from './temporary-item-receipt.entity';
export declare class TemporaryItemReceiptFactor {
    TemporaryItemReceiptFactorID: number;
    TemporaryItemReceiptRef: number;
    temporaryItemReceipt?: TemporaryItemReceipt;
    RowNo: number;
    FactorTitle: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

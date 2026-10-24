import { ReceivedChequeOperation } from './received-cheque-operation.entity';
import { ReceiptCheque } from './receipt-cheque.entity';
import { Cash } from './cash.entity';
export declare class ReceivedChequeOperationItem {
    receivedChequeOperationItemId: number;
    operationRef: number;
    operation: ReceivedChequeOperation;
    receiptChequeRef: number;
    receiptCheque: ReceiptCheque;
    chequeStatus: number | null;
    forecastDate: string | null;
    cashRef: number | null;
    cash: Cash;
}

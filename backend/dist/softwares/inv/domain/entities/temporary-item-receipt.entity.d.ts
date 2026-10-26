import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TemporaryItemReceiptDetail } from './temporary-item-receipt-detail.entity';
import { TemporaryItemReceiptFactor } from './temporary-item-receipt-factor.entity';
export declare class TemporaryItemReceipt extends AppBaseEntity {
    TemporaryItemReceiptID: number;
    Type: number;
    BaseType: number;
    SupplyRequestRef?: number;
    SupplierRef?: number;
    SupplierName?: string;
    ReceiptNumber: number;
    ReceiptDate: Date | string;
    BaseDocumentNumber?: string;
    Status: number;
    CurrencyRef: number;
    Description?: string;
    FiscalYearRef?: number;
    details?: TemporaryItemReceiptDetail[];
    factors?: TemporaryItemReceiptFactor[];
}

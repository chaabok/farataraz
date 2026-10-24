import { TemporaryItemReceipt } from './temporary-item-receipt.entity';
import { Item } from './item.entity';
import { TemporaryItemReceiptTrackingFactor } from './temporary-item-receipt-tracking-factor.entity';
export declare class TemporaryItemReceiptDetail {
    TemporaryItemReceiptDetailID: number;
    TemporaryItemReceiptRef: number;
    temporaryItemReceipt?: TemporaryItemReceipt;
    RowNo: number;
    ItemRef?: number;
    item?: Item;
    BaseNumber?: string;
    UnitName?: string;
    UnitType: number;
    Quantity: number;
    UnitPrice: number;
    Discount: number;
    Description?: string;
    TrackingFactorValues?: any;
    trackingFactors?: TemporaryItemReceiptTrackingFactor[];
}

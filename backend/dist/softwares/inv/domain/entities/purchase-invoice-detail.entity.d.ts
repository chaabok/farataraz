import { PurchaseInvoice } from './purchase-invoice.entity';
import { Item } from './item.entity';
export declare class PurchaseInvoiceDetail {
    PurchaseInvoiceDetailID: number;
    PurchaseInvoiceRef: number;
    purchaseInvoice?: PurchaseInvoice;
    RowNo: number;
    ItemRef?: number;
    item?: Item;
    UnitType: number;
    Quantity: number;
    UnitPrice: number;
    Discount: number;
    Description?: string;
    TrackingFactorValues?: any;
}

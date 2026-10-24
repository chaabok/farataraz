import { ServicePurchaseInvoice } from './service-purchase-invoice.entity';
import { Item } from './item.entity';
export declare class ServicePurchaseInvoiceDetail {
    ServicePurchaseInvoiceDetailID: number;
    ServicePurchaseInvoiceRef: number;
    servicePurchaseInvoice?: ServicePurchaseInvoice;
    RowNo: number;
    ItemRef?: number;
    item?: Item;
    UnitType: number;
    Quantity: number;
    UnitPrice: number;
    Discount: number;
    Description?: string;
}

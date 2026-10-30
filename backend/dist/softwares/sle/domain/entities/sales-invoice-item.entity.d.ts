import { SalesInvoice } from './sales-invoice.entity';
export declare class SalesInvoiceItem {
    SalesInvoiceItemID: number;
    SalesInvoiceRef: number;
    RowNo: number;
    ItemRef?: number;
    ItemCode?: string;
    ItemName?: string;
    UnitName?: string;
    Quantity: number;
    UnitPrice: number;
    TotalPrice: number;
    Description?: string;
    TrackingFactorValues?: any;
    salesInvoice?: SalesInvoice;
}

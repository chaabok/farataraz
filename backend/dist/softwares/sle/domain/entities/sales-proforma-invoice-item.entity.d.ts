import { SalesProformaInvoice } from './sales-proforma-invoice.entity';
export declare class SalesProformaInvoiceItem {
    SalesProformaInvoiceItemID: number;
    SalesProformaRef: number;
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
    salesProforma?: SalesProformaInvoice;
}

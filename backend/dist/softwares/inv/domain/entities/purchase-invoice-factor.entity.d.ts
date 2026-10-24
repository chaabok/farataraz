import { PurchaseInvoice } from './purchase-invoice.entity';
export declare class PurchaseInvoiceFactor {
    PurchaseInvoiceFactorID: number;
    PurchaseInvoiceRef: number;
    purchaseInvoice?: PurchaseInvoice;
    RowNo: number;
    FactorTitle?: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

import { SalesInvoice } from './sales-invoice.entity';
export declare class SalesInvoiceFactor {
    SalesInvoiceFactorID: number;
    SalesInvoiceRef: number;
    salesInvoice?: SalesInvoice;
    RowNo: number;
    FactorTitle?: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

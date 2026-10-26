import { SalesProformaInvoice } from './sales-proforma-invoice.entity';
export declare class SalesProformaInvoiceFactor {
    SalesProformaInvoiceFactorID: number;
    SalesProformaRef: number;
    salesProforma?: SalesProformaInvoice;
    RowNo: number;
    FactorTitle?: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

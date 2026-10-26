import { ServicePurchaseInvoice } from './service-purchase-invoice.entity';
export declare class ServicePurchaseInvoiceFactor {
    ServicePurchaseInvoiceFactorID: number;
    ServicePurchaseInvoiceRef: number;
    servicePurchaseInvoice?: ServicePurchaseInvoice;
    RowNo: number;
    FactorTitle?: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

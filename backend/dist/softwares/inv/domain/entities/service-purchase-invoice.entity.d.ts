import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ServicePurchaseInvoiceDetail } from './service-purchase-invoice-detail.entity';
import { ServicePurchaseInvoiceFactor } from './service-purchase-invoice-factor.entity';
export declare class ServicePurchaseInvoice extends AppBaseEntity {
    ServicePurchaseInvoiceID: number;
    BaseType: number;
    SupplyRequestRef?: number;
    SupplierRef?: number;
    SupplierName?: string;
    InvoiceNumber: number;
    InvoiceDate: Date | string;
    BaseDocumentNumber?: string;
    Status: number;
    CurrencyRef: number;
    Description?: string;
    FiscalYearRef?: number;
    details?: ServicePurchaseInvoiceDetail[];
    factors?: ServicePurchaseInvoiceFactor[];
}

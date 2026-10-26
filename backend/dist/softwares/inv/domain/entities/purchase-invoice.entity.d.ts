import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PurchaseInvoiceDetail } from './purchase-invoice-detail.entity';
import { PurchaseInvoiceFactor } from './purchase-invoice-factor.entity';
export declare class PurchaseInvoice extends AppBaseEntity {
    PurchaseInvoiceID: number;
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
    details?: PurchaseInvoiceDetail[];
    factors?: PurchaseInvoiceFactor[];
}

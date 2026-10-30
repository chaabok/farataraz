import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesInvoiceItem } from './sales-invoice-item.entity';
import { SalesInvoiceFactor } from './sales-invoice-factor.entity';
export declare class SalesInvoice extends AppBaseEntity {
    SalesInvoiceID: number;
    InvoiceNumber: number;
    InvoiceDate?: string;
    CustomerRef?: number;
    CustomerName?: string;
    SalesTypeRef?: number;
    SalesCenterRef?: number;
    DeliveryLocationRef?: number;
    SettlementMethodRef?: number;
    Status: number;
    Description?: string;
    BaseDocumentTypeRef?: number;
    BaseDocumentRef?: number;
    FiscalYearRef?: number;
    items?: SalesInvoiceItem[];
    factors?: SalesInvoiceFactor[];
}

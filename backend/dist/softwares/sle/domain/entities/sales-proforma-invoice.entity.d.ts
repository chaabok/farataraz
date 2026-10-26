import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesProformaInvoiceItem } from './sales-proforma-invoice-item.entity';
import { SalesProformaInvoiceFactor } from './sales-proforma-invoice-factor.entity';
export declare class SalesProformaInvoice extends AppBaseEntity {
    SalesProformaID: number;
    ProformaNumber: number;
    ProformaDate?: string;
    ValidityDate?: string;
    CustomerRef?: number;
    CustomerName?: string;
    SalesTypeRef?: number;
    SalesCenterRef?: number;
    DeliveryLocationRef?: number;
    SettlementMethodRef?: number;
    Status: number;
    Description?: string;
    FiscalYearRef?: number;
    items?: SalesProformaInvoiceItem[];
    factors?: SalesProformaInvoiceFactor[];
}

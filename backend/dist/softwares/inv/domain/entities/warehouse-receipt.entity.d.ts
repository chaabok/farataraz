import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { WarehouseReceiptDetail } from './warehouse-receipt-detail.entity';
import { WarehouseReceiptFactor } from './warehouse-receipt-factor.entity';
export declare class WarehouseReceipt extends AppBaseEntity {
    WarehouseReceiptID: number;
    BaseType: number;
    WarehouseDocumentTypeRef?: number;
    WarehouseRef?: number;
    WarehouseName?: string;
    TemporaryReceiptRef?: number;
    SupplyRequestRef?: number;
    PurchaseInvoiceRef?: number;
    SalesInvoiceRef?: number;
    SupplierRef?: number;
    SupplierName?: string;
    ReceiptNumber: number;
    ReceiptDate: Date | string;
    BaseDocumentNumber?: string;
    Status: number;
    CurrencyRef: number;
    Description?: string;
    FiscalYearRef?: number;
    details?: WarehouseReceiptDetail[];
    factors?: WarehouseReceiptFactor[];
}

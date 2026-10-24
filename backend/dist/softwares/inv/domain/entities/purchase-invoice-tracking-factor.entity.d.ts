import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PurchaseInvoiceDetail } from './purchase-invoice-detail.entity';
export declare class PurchaseInvoiceTrackingFactor extends AppBaseEntity {
    PurchaseInvoiceTrackingFactorID: number;
    PurchaseInvoiceDetailRef: number;
    TrackingFactorRef?: number;
    TrackingFactorCode?: number;
    TrackingFactorName?: string;
    Quantity: number;
    FactorValue?: string;
    StartValue?: string;
    EndValue?: string;
    TrackingFactorValues?: any;
    purchaseInvoiceDetail?: PurchaseInvoiceDetail;
}

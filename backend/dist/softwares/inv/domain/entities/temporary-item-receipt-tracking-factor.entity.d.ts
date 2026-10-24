import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TemporaryItemReceiptDetail } from './temporary-item-receipt-detail.entity';
export declare class TemporaryItemReceiptTrackingFactor extends AppBaseEntity {
    TemporaryItemReceiptTrackingFactorID: number;
    TemporaryItemReceiptDetailRef: number;
    TrackingFactorRef?: number;
    TrackingFactorCode?: number;
    TrackingFactorName?: string;
    Quantity: number;
    FactorValue?: string;
    StartValue?: string;
    EndValue?: string;
    TrackingFactorValues?: any;
    temporaryItemReceiptDetail?: TemporaryItemReceiptDetail;
}

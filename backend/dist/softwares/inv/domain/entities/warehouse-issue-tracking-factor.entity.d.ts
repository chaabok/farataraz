import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { WarehouseReceiptDetail } from './warehouse-receipt-detail.entity';
export declare class WarehouseIssueTrackingFactor extends AppBaseEntity {
    WarehouseIssueTrackingFactorID: number;
    WarehouseIssueDetailRef: number;
    TrackingFactorRef?: number;
    TrackingFactorCode?: number;
    TrackingFactorName?: string;
    Quantity: number;
    FactorValue?: string;
    StartValue?: string;
    EndValue?: string;
    TrackingFactorValues?: any;
    warehouseReceiptDetail?: WarehouseReceiptDetail;
}

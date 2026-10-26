import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemRequestDetail } from './item-request-detail.entity';
export declare class ItemRequestTrackingFactor extends AppBaseEntity {
    ItemRequestTrackingFactorID: number;
    ItemRequestDetailRef: number;
    TrackingFactorRef?: number;
    TrackingFactorCode?: number;
    TrackingFactorName?: string;
    Quantity: number;
    FactorValue?: string;
    StartValue?: string;
    EndValue?: string;
    TrackingFactorValues?: any;
    itemRequestDetail?: ItemRequestDetail;
}

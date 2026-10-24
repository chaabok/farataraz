import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemSupplyRequestDetail } from './item-supply-request-detail.entity';
export declare class ItemSupplyRequestTrackingFactor extends AppBaseEntity {
    ItemSupplyRequestTrackingFactorID: number;
    ItemSupplyRequestDetailRef: number;
    TrackingFactorRef?: number;
    TrackingFactorCode?: number;
    TrackingFactorName?: string;
    Quantity: number;
    FactorValue?: string;
    StartValue?: string;
    EndValue?: string;
    TrackingFactorValues?: any;
    itemSupplyRequestDetail?: ItemSupplyRequestDetail;
}

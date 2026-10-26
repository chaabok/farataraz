import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { TrackingFactor } from './tracking-factor.entity';
import { Item } from './item.entity';
export declare class TrackingFactorItemRelated extends AppBaseEntity {
    TrackingFactorItemRelatedID: number;
    TrackingFactorRef: number;
    ItemRef: number;
    trackingFactor: TrackingFactor;
    item: Item;
}

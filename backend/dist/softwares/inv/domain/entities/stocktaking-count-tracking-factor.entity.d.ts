import { StocktakingCountDetail } from './stocktaking-count-detail.entity';
import { TrackingFactor } from './tracking-factor.entity';
export declare class StocktakingCountTrackingFactor {
    StocktakingCountTrackingFactorID: number;
    StocktakingCountDetailRef: number;
    countDetail?: StocktakingCountDetail;
    TrackingFactorRef: number;
    trackingFactor?: TrackingFactor;
    FactorValue?: string;
    CountedQuantity: number;
}

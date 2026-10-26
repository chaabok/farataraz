import { StocktakingCount } from './stocktaking-count.entity';
import { Item } from './item.entity';
import { StocktakingCountTrackingFactor } from './stocktaking-count-tracking-factor.entity';
export declare class StocktakingCountDetail {
    StocktakingCountDetailID: number;
    StocktakingCountRef: number;
    count?: StocktakingCount;
    RowNumber: number;
    ItemRef: number;
    item?: Item;
    TagNumber?: string;
    CountedQuantity: number;
    Description?: string;
    trackingFactors?: StocktakingCountTrackingFactor[];
}

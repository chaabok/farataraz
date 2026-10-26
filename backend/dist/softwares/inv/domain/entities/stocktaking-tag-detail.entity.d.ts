import { StocktakingTagHeader } from './stocktaking-tag-header.entity';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';
export declare class StocktakingTagDetail {
    StocktakingTagDetailID: number;
    StocktakingTagHeaderRef: number;
    header?: StocktakingTagHeader;
    WarehouseRef: number;
    warehouse?: Warehouse;
    ItemRef: number;
    item?: Item;
    TagNumber: string;
}

import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';
import { Item } from './item.entity';
export declare class StocktakingTag extends AppBaseEntity {
    StocktakingTagID: number;
    StocktakingRef: number;
    WarehouseRef: number;
    warehouse?: Warehouse;
    ItemRef: number;
    item?: Item;
    TagNumber: string;
}

import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Item } from './item.entity';
export declare class ItemInventoryControl extends AppBaseEntity {
    ItemInventoryControlID: number;
    ItemRef: number;
    Item: Item;
    EffectiveDate: string;
    MinQuantity: number;
    MaxQuantity: number;
    OrderQuantity: number;
    ReorderPoint: number;
    Description: string;
}

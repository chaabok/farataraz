import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Item } from './item.entity';
import { Warehouse } from './warehouse.entity';
export declare class ItemPhysicalLocation extends AppBaseEntity {
    ItemPhysicalLocationID: number;
    ItemRef: number;
    Item: Item;
    WarehouseRef: number;
    Warehouse: Warehouse;
    IsDefault: boolean;
}

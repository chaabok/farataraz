import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Item } from './item.entity';
export declare class ItemVolumeCbm extends AppBaseEntity {
    ItemVolumeCbmID: number;
    ItemRef: number;
    Item: Item;
    Quantity: number;
    MeasurementUnitRef: number;
    Length: number;
    Width: number;
    Height: number;
    Volume: number;
    Description: string;
}

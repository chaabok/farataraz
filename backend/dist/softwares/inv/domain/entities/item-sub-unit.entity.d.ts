import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Item } from './item.entity';
import { MeasurementUnit } from './measurement-unit.entity';
export declare class ItemSubUnit extends AppBaseEntity {
    ItemSubUnitID: number;
    ItemRef: number;
    Item: Item;
    SubUnitRef: number;
    SubUnit: MeasurementUnit;
    MainToSubRatio: number;
    IsVariableRatio: number;
    TolerancePercent: number;
}

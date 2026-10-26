import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemPackage } from './item-package.entity';
import { Item } from './item.entity';
import { MeasurementUnit } from './measurement-unit.entity';
export declare class ItemPackageDetail extends AppBaseEntity {
    ItemPackageDetailID: number;
    ItemPackageRef: number;
    ItemPackage?: ItemPackage;
    RowNo: number;
    ItemRef: number;
    Item?: Item;
    MeasurementUnitRef: number;
    MeasurementUnit?: MeasurementUnit;
    Quantity: number;
    Description: string;
    FiscalYearRef?: number;
}

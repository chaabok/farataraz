import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';
import { MeasurementUnit } from './measurement-unit.entity';
export declare class WarehouseProduct extends AppBaseEntity {
    WarehouseProductID: number;
    WarehouseRef: number;
    Warehouse: Warehouse;
    ProductCode: string;
    ProductTitle: string;
    MeasurementUnitRef: number;
    MeasurementUnit: MeasurementUnit;
}

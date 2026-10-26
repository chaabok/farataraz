import { StocktakingSetting } from './stocktaking-setting.entity';
import { Warehouse } from './warehouse.entity';
export declare class StocktakingSettingWarehouse {
    StocktakingSettingWarehouseID: number;
    StocktakingSettingRef: number;
    stocktakingSetting?: StocktakingSetting;
    WarehouseRef: number;
    warehouse?: Warehouse;
}

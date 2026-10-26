import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';
import { Party } from '../../../common/domain/entities/party.entity';
export declare class WarehouseKeeper extends AppBaseEntity {
    WarehouseKeeperID: number;
    WarehouseRef: number;
    Warehouse: Warehouse;
    WarehouseKeeperRef: number;
    WarehouseKeeper: Party;
    Address: string;
    MobilePhone: string;
    Phone: string;
}

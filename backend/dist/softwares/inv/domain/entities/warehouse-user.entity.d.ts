import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';
import { User } from '../../../../core/iam/entities/user.entity';
export declare class WarehouseUser extends AppBaseEntity {
    WarehouseUserID: number;
    WarehouseRef: number;
    Warehouse: Warehouse;
    UserRef: number;
    User: User;
}

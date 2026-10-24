import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Warehouse } from './warehouse.entity';
export declare class WarehouseAddress extends AppBaseEntity {
    WarehouseAddressID: number;
    WarehouseRef: number;
    Warehouse: Warehouse;
    AddressState: string;
    AddressCity: string;
    AddressTitle: string;
    AddressTitle2: string;
    PostalCode: string;
    Longitude: string;
    Latitude: string;
}

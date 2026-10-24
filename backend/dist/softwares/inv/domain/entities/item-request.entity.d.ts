import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemRequestDetail } from './item-request-detail.entity';
export declare class ItemRequest extends AppBaseEntity {
    ItemRequestID: number;
    BasisType: number;
    RequestNumber: number;
    RequestDate: Date | string;
    RequestType?: number;
    Priority: number;
    Status: number;
    Requester: string;
    RequesterRef?: number;
    WarehouseRef?: number;
    Description?: string;
    FiscalYearRef?: number;
    details?: ItemRequestDetail[];
}

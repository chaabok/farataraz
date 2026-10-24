import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemSupplyRequestDetail } from './item-supply-request-detail.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
export declare class ItemSupplyRequest extends AppBaseEntity {
    ItemSupplyRequestID: number;
    BasisType: number;
    RequestNumber: number;
    RequestDate: Date | string;
    RequestType?: number;
    Priority: number;
    Status: number;
    Requester: string;
    RequesterRef?: number;
    requesterAccount?: DetailedAccount;
    WarehouseRef?: number;
    Description?: string;
    FiscalYearRef?: number;
    details?: ItemSupplyRequestDetail[];
}

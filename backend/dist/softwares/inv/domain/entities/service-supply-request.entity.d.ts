import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ServiceSupplyRequestDetail } from './service-supply-request-detail.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
export declare class ServiceSupplyRequest extends AppBaseEntity {
    ServiceSupplyRequestID: number;
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
    details?: ServiceSupplyRequestDetail[];
}

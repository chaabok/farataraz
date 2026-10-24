import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ServiceRequestDetail } from './service-request-detail.entity';
export declare enum SupplyRequestBaseType {
    None = 1,
    InventoryControl = 2,
    ItemRequest = 3
}
export declare class ServiceRequest extends AppBaseEntity {
    ServiceRequestID: number;
    BaseSource: number;
    RequestNumber: number;
    RequestDate: Date | string;
    Priority: number;
    Status: number;
    Requester: string;
    RequesterRef?: number;
    Description?: string;
    FiscalYearRef?: number;
    details?: ServiceRequestDetail[];
}

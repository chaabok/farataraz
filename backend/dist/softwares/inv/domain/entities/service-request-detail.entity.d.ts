import { ServiceRequest } from './service-request.entity';
import { Item } from './item.entity';
export declare class ServiceRequestDetail {
    ServiceRequestDetailID: number;
    ServiceRequestRef: number;
    RowNo: number;
    ItemRef: number;
    RequestQuantity: number;
    ApprovedQuantity: number;
    DeliveryDate?: string;
    Description?: string;
    serviceRequest?: ServiceRequest;
    item?: Item;
}

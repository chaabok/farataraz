import { ServiceSupplyRequest } from './service-supply-request.entity';
import { Item } from './item.entity';
export declare class ServiceSupplyRequestDetail {
    ServiceSupplyRequestDetailID: number;
    ServiceSupplyRequestRef: number;
    RowNo: number;
    ItemRef: number;
    RequestQuantity: number;
    ApprovedQuantity: number;
    DeliveryDate?: Date | string;
    Description?: string;
    serviceSupplyRequest?: ServiceSupplyRequest;
    item?: Item;
}

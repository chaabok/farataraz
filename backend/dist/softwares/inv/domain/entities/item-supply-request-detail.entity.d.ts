import { ItemSupplyRequest } from './item-supply-request.entity';
import { Item } from './item.entity';
export declare class ItemSupplyRequestDetail {
    ItemSupplyRequestDetailID: number;
    ItemSupplyRequestRef: number;
    RowNo: number;
    ItemRef: number;
    RequestQuantity: number;
    ApprovedQuantity: number;
    DeliveryDate?: Date | string;
    Description?: string;
    TrackingFactorValues?: any;
    itemSupplyRequest?: ItemSupplyRequest;
    item?: Item;
}

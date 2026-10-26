import { ItemRequest } from './item-request.entity';
import { Item } from './item.entity';
import { ItemRequestTrackingFactor } from './item-request-tracking-factor.entity';
export declare class ItemRequestDetail {
    ItemRequestDetailID: number;
    ItemRequestRef: number;
    RowNo: number;
    ItemRef: number;
    RequestQuantity: number;
    ApprovedQuantity: number;
    DeliveryDate?: Date | string;
    Description?: string;
    TrackingFactorValues?: any;
    itemRequest?: ItemRequest;
    item?: Item;
    trackingFactors?: ItemRequestTrackingFactor[];
}

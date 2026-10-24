import { WarehouseReceipt } from './warehouse-receipt.entity';
import { Item } from './item.entity';
export declare class WarehouseReceiptDetail {
    WarehouseReceiptDetailID: number;
    WarehouseReceiptRef: number;
    warehouseReceipt?: WarehouseReceipt;
    RowNo: number;
    ItemRef?: number;
    item?: Item;
    WarehouseRef?: number;
    BaseNumber?: string;
    UnitName?: string;
    UnitType: number;
    Quantity: number;
    UnitPrice: number;
    Discount: number;
    TotalPrice: number;
    Description?: string;
    TrackingFactorValues?: any;
}

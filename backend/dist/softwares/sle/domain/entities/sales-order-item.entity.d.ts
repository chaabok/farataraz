import { SalesOrder } from './sales-order.entity';
export declare class SalesOrderItem {
    SalesOrderItemID: number;
    SalesOrderRef: number;
    RowNo: number;
    ItemRef?: number;
    ItemCode?: string;
    ItemName?: string;
    UnitName?: string;
    Quantity: number;
    UnitPrice: number;
    TotalPrice: number;
    Description?: string;
    salesOrder?: SalesOrder;
}

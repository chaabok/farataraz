import { SalesOrder } from './sales-order.entity';
export declare class SalesOrderDetail {
    SalesOrderDetailID: number;
    SalesOrderRef: number;
    salesOrder?: SalesOrder;
    RowNo: number;
    ItemRef?: number;
    UnitName?: string;
    UnitType: number;
    Quantity: number;
    UnitPrice: number;
    Discount: number;
    TotalPrice: number;
    PriceAfterDiscount: number;
    Additions: number;
    NetPrice: number;
    Description?: string;
    TrackingFactorValues?: any;
}

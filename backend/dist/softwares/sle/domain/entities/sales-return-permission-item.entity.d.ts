import { SalesReturnPermission } from './sales-return-permission.entity';
export declare class SalesReturnPermissionItem {
    SalesReturnPermissionItemID: number;
    SalesReturnPermissionRef: number;
    RowNo: number;
    ItemRef?: number;
    ItemCode?: string;
    ItemName?: string;
    UnitName?: string;
    Quantity: number;
    UnitPrice: number;
    TotalPrice: number;
    Description?: string;
    TrackingFactorValues?: any;
    salesReturnPermission?: SalesReturnPermission;
}

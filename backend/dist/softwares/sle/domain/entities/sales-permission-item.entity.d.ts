import { SalesPermission } from './sales-permission.entity';
export declare class SalesPermissionItem {
    SalesPermissionItemID: number;
    SalesPermissionRef: number;
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
    salesPermission?: SalesPermission;
}

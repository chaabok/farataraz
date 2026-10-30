import { SalesPermission } from './sales-permission.entity';
export declare class SalesPermissionFactor {
    SalesPermissionFactorID: number;
    SalesPermissionRef: number;
    salesPermission?: SalesPermission;
    RowNo: number;
    FactorTitle?: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

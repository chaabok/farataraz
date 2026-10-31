import { SalesReturnPermission } from './sales-return-permission.entity';
export declare class SalesReturnPermissionFactor {
    SalesReturnPermissionFactorID: number;
    SalesReturnPermissionRef: number;
    salesReturnPermission?: SalesReturnPermission;
    RowNo: number;
    FactorTitle?: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

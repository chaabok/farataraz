import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesReturnPermissionItem } from './sales-return-permission-item.entity';
import { SalesReturnPermissionFactor } from './sales-return-permission-factor.entity';
export declare class SalesReturnPermission extends AppBaseEntity {
    SalesReturnPermissionID: number;
    PermissionNumber: number;
    PermissionDate?: string;
    CustomerRef?: number;
    CustomerName?: string;
    SalesTypeRef?: number;
    SalesCenterRef?: number;
    DeliveryLocationRef?: number;
    SettlementMethodRef?: number;
    Status: number;
    Description?: string;
    BaseDocumentTypeRef?: number;
    BaseDocumentRef?: number;
    FiscalYearRef?: number;
    items?: SalesReturnPermissionItem[];
    factors?: SalesReturnPermissionFactor[];
}

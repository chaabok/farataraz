import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesPermissionItem } from './sales-permission-item.entity';
import { SalesPermissionFactor } from './sales-permission-factor.entity';
export declare class SalesPermission extends AppBaseEntity {
    SalesPermissionID: number;
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
    items?: SalesPermissionItem[];
    factors?: SalesPermissionFactor[];
}

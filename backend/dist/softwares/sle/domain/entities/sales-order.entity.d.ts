import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesOrderItem } from './sales-order-item.entity';
import { SalesOrderFactor } from './sales-order-factor.entity';
export declare class SalesOrder extends AppBaseEntity {
    SalesOrderID: number;
    OrderNumber: number;
    OrderDate?: string;
    DeliveryDate?: string;
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
    items?: SalesOrderItem[];
    factors?: SalesOrderFactor[];
}

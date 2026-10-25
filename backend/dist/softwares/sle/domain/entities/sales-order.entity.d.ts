import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesOrderItem } from './sales-order-item.entity';
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
    FiscalYearRef?: number;
    items?: SalesOrderItem[];
}

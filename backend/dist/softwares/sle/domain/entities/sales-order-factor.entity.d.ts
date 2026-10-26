import { SalesOrder } from './sales-order.entity';
export declare class SalesOrderFactor {
    SalesOrderFactorID: number;
    SalesOrderRef: number;
    salesOrder?: SalesOrder;
    RowNo: number;
    FactorTitle?: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

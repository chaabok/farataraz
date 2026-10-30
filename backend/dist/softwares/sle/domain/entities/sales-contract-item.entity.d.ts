import { SalesContract } from './sales-contract.entity';
export declare class SalesContractItem {
    SalesContractItemID: number;
    SalesContractRef: number;
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
    salesContract?: SalesContract;
}

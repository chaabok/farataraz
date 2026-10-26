import { WarehouseReceipt } from './warehouse-receipt.entity';
export declare class WarehouseReceiptFactor {
    WarehouseReceiptFactorID: number;
    WarehouseReceiptRef: number;
    warehouseReceipt?: WarehouseReceipt;
    RowNo: number;
    FactorTitle?: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

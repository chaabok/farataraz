import { SalesContract } from './sales-contract.entity';
export declare class SalesContractFactor {
    SalesContractFactorID: number;
    SalesContractRef: number;
    salesContract?: SalesContract;
    RowNo: number;
    FactorTitle?: string;
    FactorType: number;
    Amount: number;
    Description?: string;
}

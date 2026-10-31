import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesContractItem } from './sales-contract-item.entity';
import { SalesContractFactor } from './sales-contract-factor.entity';
export declare class SalesContract extends AppBaseEntity {
    SalesContractID: number;
    ContractNumber: number;
    DocumentDate?: string;
    ContractDate?: string;
    CustomerRef?: number;
    CustomerName?: string;
    SalesTypeRef?: number;
    SalesCenterRef?: number;
    DeliveryLocationRef?: number;
    SettlementMethodRef?: number;
    Status: number;
    ContractSubject?: string;
    BaseDocumentTypeRef?: number;
    BaseDocumentRef?: number;
    FiscalYearRef?: number;
    items?: SalesContractItem[];
    factors?: SalesContractFactor[];
}

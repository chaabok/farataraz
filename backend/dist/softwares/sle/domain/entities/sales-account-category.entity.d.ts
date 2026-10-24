import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class SalesAccountCategory extends AppBaseEntity {
    SalesAccountCategoryID: number;
    SalesAccountCategoryCode: number;
    SalesAccountCategoryName: string;
    SalesAccountCategoryName2: string;
    IsActive: boolean;
    InventorySlAccountRef: number;
    IndividualPurchaseSlAccountRef: number;
    CorporatePurchaseSlAccountRef: number;
    FreightSlAccountRef: number;
    SuspensePurchaseSlAccountRef: number;
    ForeignPurchaseSlAccountRef: number;
    CurrencyRef: number;
}

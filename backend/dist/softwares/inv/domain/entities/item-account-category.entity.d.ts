import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class ItemAccountCategory extends AppBaseEntity {
    ItemAccountCategoryID: number;
    ItemAccountCategoryCode: number;
    ItemAccountCategoryName: string;
    ItemAccountCategoryName2: string;
    PricingMethod: number;
    StandardRate: number;
    IsActive: boolean;
    InventorySlAccountRef: number;
    IndividualPurchaseSlAccountRef: number;
    CorporatePurchaseSlAccountRef: number;
    FreightSlAccountRef: number;
    SuspensePurchaseSlAccountRef: number;
    ForeignPurchaseSlAccountRef: number;
    ScrapExpenseSlAccountRef: number;
    ConsignmentOursSlAccountRef: number;
    ConsignmentOthersSlAccountRef: number;
    ConsignmentOffsetSlAccountRef: number;
    IndividualPrepaymentSlAccountRef: number;
    CorporatePrepaymentSlAccountRef: number;
    ScrapIncomeSlAccountRef: number;
}

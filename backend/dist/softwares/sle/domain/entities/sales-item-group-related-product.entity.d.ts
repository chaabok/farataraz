import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesItemGroup } from './sales-item-group.entity';
export declare class SalesItemGroupRelatedProduct extends AppBaseEntity {
    SalesItemGroupRelatedProductID: number;
    SalesItemGroupRef: number;
    salesItemGroup: SalesItemGroup;
    ProductCode: string;
    ProductName: string;
    Unit: string;
    IsActive: boolean;
    Description: string;
}

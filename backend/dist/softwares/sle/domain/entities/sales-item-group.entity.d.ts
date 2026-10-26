import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { SalesItemGroupRelatedProduct } from './sales-item-group-related-product.entity';
export declare class SalesItemGroup extends AppBaseEntity {
    SalesItemGroupID: number;
    SalesItemGroupCode: string;
    SalesItemGroupName: string;
    SalesItemGroupName2: string;
    Description: string;
    IsMandatory: boolean;
    ParentRef: number | null;
    parent?: SalesItemGroup;
    children?: SalesItemGroup[];
    relatedProducts?: SalesItemGroupRelatedProduct[];
}

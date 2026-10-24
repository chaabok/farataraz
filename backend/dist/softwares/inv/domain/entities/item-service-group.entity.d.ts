import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemServiceGroupField } from './item-service-group-field.entity';
import { ItemServiceGroupRelatedProduct } from './item-service-group-related-product.entity';
export declare class ItemServiceGroup extends AppBaseEntity {
    ItemServiceGroupID: number;
    ItemServiceGroupCode: string;
    ItemServiceGroupName: string;
    ItemServiceGroupName2: string;
    Description: string;
    IsMandatory: boolean;
    ParentRef: number | null;
    parent?: ItemServiceGroup;
    children?: ItemServiceGroup[];
    fields?: ItemServiceGroupField[];
    relatedProducts?: ItemServiceGroupRelatedProduct[];
}

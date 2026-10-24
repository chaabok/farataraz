import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemServiceGroup } from './item-service-group.entity';
export declare class ItemServiceGroupRelatedProduct extends AppBaseEntity {
    ItemServiceGroupRelatedProductID: number;
    ItemServiceGroupRef: number;
    itemServiceGroup?: ItemServiceGroup;
    ProductCode: string;
    ProductName: string;
    Unit: string;
    IsActive: boolean;
    Description: string;
}

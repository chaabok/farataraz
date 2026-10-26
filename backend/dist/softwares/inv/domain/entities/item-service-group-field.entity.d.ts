import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ItemServiceGroup } from './item-service-group.entity';
export declare class ItemServiceGroupField extends AppBaseEntity {
    ItemServiceGroupFieldID: number;
    ItemServiceGroupRef: number;
    itemServiceGroup?: ItemServiceGroup;
    FieldTitle: string;
    FieldTitle2: string;
    FieldType: number;
    IsRequired: boolean;
    Options: string;
    RowNo: number;
}

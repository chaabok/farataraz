import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { EntityType } from './entity-type.enum';
export declare class GnrEntity extends AppBaseEntity {
    entityID: number;
    parentRef: number | null;
    entityName: string;
    entityType: EntityType;
    parent?: GnrEntity;
}

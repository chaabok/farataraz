import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class EntityNumbering extends AppBaseEntity {
    entityNumberingId: number;
    entityRef: string;
    numberingMethod: string;
    numberingType: string;
    baseNumbering: string[];
    items: any;
}

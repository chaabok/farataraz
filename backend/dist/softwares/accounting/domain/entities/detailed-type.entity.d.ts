import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class DetailedType extends AppBaseEntity {
    detailedTypesId: number;
    code: string;
    title: string;
    title_en: string;
    description: string;
    isActive: boolean;
}

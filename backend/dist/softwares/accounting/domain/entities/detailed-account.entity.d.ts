import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedType } from './detailed-type.entity';
export declare class DetailedAccount extends AppBaseEntity {
    detailedAccountId: number;
    code: string;
    title: string;
    title_en: string;
    detailedTypesId: number;
    detailedType: DetailedType;
    description: string;
    isActive: boolean;
}

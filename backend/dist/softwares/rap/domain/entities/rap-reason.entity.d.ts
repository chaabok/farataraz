import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BusinessStructure } from '../../../common/domain/entities/business-structure.entity';
export declare enum RapReasonNature {
    SOURCE = 1,
    USE = 2,
    NEUTRAL = 3
}
export declare class RapReason extends AppBaseEntity {
    RapReasonID: number;
    Code: string;
    Title: string;
    Title_En: string;
    AccountRef: number;
    Nature: RapReasonNature;
    Description: string;
    IsActive: boolean;
    ParentRef: number;
    Parent: RapReason;
    Children: RapReason[];
    BusinessStructure: BusinessStructure;
    Company: BusinessStructure;
}

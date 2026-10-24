import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class DetailedAccountsNumbering extends AppBaseEntity {
    id: number;
    detailedTypesId: number;
    isHeadquarterSelected: boolean;
    isCompanySelected: boolean;
    startNumber: number;
    endNumber: number;
}

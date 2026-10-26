import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class SettlementMethod extends AppBaseEntity {
    SettlementMethodID: number;
    Code: number;
    Title: string;
    Title2: string;
    IsActive: boolean;
    Description: string;
}

import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class Wallet extends AppBaseEntity {
    WalletID: number;
    Code: number;
    Title: string;
    Title2: string;
    Nature: number;
    IsActive: boolean;
    Description: string;
}

import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class BankAccountType extends AppBaseEntity {
    bankAccountTypeId: number;
    code: number;
    title: string;
    latinTitle: string;
    isActive: boolean;
}

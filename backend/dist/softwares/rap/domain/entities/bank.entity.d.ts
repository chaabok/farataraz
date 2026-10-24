import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankType } from './bank-type.enum';
export declare class Bank extends AppBaseEntity {
    bankId: number;
    code: number;
    title: string;
    latinTitle: string;
    bankType: BankType;
    swiftCode: string;
    nationalityRef: number | null;
    phone: string;
    website: string;
    description: string;
}

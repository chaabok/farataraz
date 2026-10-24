import { BankType } from '../../domain/entities/bank-type.enum';
export declare class CreateBankDto {
    code: number;
    title: string;
    latinTitle?: string;
    bankType: BankType;
    swiftCode?: string;
    nationalityRef?: number;
    phone?: string;
    website?: string;
    description?: string;
}

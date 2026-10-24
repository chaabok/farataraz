import { BankAccount } from '../entities/bank-account.entity';
export interface IBankAccountRepository {
    create(bankAccount: BankAccount): Promise<BankAccount>;
    update(bankAccountId: number, bankAccount: Partial<BankAccount>): Promise<BankAccount>;
    delete(bankAccountId: number): Promise<void>;
    findById(bankAccountId: number): Promise<BankAccount | null>;
    findAll(options?: any): Promise<{
        items: BankAccount[];
        total: number;
    }>;
}
export declare const IBankAccountRepositoryToken: unique symbol;

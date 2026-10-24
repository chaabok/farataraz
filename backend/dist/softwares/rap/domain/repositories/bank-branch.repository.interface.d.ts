import { BankBranch } from '../entities/bank-branch.entity';
export declare const IBankBranchRepositoryToken: unique symbol;
export interface IBankBranchRepository {
    create(data: Partial<BankBranch>): Promise<BankBranch>;
    update(id: number, data: Partial<BankBranch>): Promise<void>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<BankBranch | null>;
    findAll(): Promise<BankBranch[]>;
    findAdvanced(params: any): Promise<[BankBranch[], number]>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}

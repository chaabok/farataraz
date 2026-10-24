import { BankAccountType } from '../entities/bank-account-type.entity';

export const IBankAccountTypeRepositoryToken = Symbol('IBankAccountTypeRepository');

export interface IBankAccountTypeRepository {
  findAll(): Promise<BankAccountType[]>;
  findById(id: number): Promise<BankAccountType | null>;
  create(entity: BankAccountType): Promise<BankAccountType>;
  update(id: number, entity: Partial<BankAccountType>): Promise<BankAccountType>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
  getMaxId(): Promise<number>;
  findAdvanced(params: any): Promise<[BankAccountType[], number]>;
}

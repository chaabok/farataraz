import { Account } from '../entities/account.entity';

export interface IAccountRepository {
  create(data: Partial<Account>): Promise<Account>;
  update(id: number, data: Partial<Account>): Promise<Account>;
  findAll(search?: string, level?: number, options?: any): Promise<Account[]>;
  findById(id: number): Promise<Account | null>;
  findByCode(code: string): Promise<Account | null>;
  findByTitle(title: string): Promise<Account | null>;
  checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
  delete(id: number): Promise<void>;
  getGroupAccountLength(): Promise<number>;
}

export const IAccountRepositoryToken = Symbol('IAccountRepository');

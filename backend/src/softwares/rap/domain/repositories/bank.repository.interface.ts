import { Bank } from '../entities/bank.entity';

export const IBankRepositoryToken = Symbol('IBankRepository');

export interface IBankRepository {
  create(data: Partial<Bank>): Promise<Bank>;
  update(id: number, data: Partial<Bank>): Promise<void>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Bank | null>;
  findAll(): Promise<Bank[]>;
  findAdvanced(params: any): Promise<[Bank[], number]>;
  checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}

import { Cash } from '../entities/cash.entity';

export const ICashRepositoryToken = Symbol('ICashRepository');

export interface ICashRepository {
  create(data: Partial<Cash>): Promise<Cash>;
  update(id: number, data: Partial<Cash>): Promise<Cash>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Cash | null>;
  findAll(): Promise<Cash[]>;
  findAdvanced(params: {
    pageIndex: number;
    pageSize: number;
    sorting?: string;
    columnFilters?: string;
    globalFilter?: string;
    advancedFilters?: string;
  }): Promise<[Cash[], number]>;
  checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}

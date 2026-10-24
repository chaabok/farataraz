import { DetailedAccountsNumbering } from '../entities/detailed-accounts-numbering.entity';

export interface IDetailedAccountsNumberingRepository {
  create(data: Partial<DetailedAccountsNumbering>): Promise<DetailedAccountsNumbering>;
  update(id: number, data: Partial<DetailedAccountsNumbering>): Promise<DetailedAccountsNumbering>;
  findAll(): Promise<DetailedAccountsNumbering[]>;
  findByDetailedTypeId(detailedTypesId: number): Promise<DetailedAccountsNumbering | null>;
  upsert(detailedTypesId: number, data: Partial<DetailedAccountsNumbering>): Promise<DetailedAccountsNumbering>;
  deleteByDetailedTypeId(detailedTypesId: number): Promise<void>;
}

export const IDetailedAccountsNumberingRepositoryToken = Symbol('IDetailedAccountsNumberingRepository');

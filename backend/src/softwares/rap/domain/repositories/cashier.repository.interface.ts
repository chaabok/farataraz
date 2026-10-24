import { Cashier } from '../entities/cashier.entity';

export const ICashierRepositoryToken = Symbol('ICashierRepository');

export interface ICashierRepository {
  create(data: Partial<Cashier>): Promise<Cashier>;
  update(id: number, data: Partial<Cashier>): Promise<Cashier>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Cashier | null>;
  findByCashId(cashId: number): Promise<Cashier[]>;
}

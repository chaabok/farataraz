import { Chequebook } from '../entities/chequebook.entity';
export const IChequebookRepositoryToken = Symbol('IChequebookRepository');

export interface IChequebookRepository {
  create(chequebook: Partial<Chequebook>): Promise<Chequebook>;
  update(id: number, chequebook: Partial<Chequebook>): Promise<Chequebook>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Chequebook | null>;
  findAll(options?: any): Promise<{items: Chequebook[], total: number}>;
}

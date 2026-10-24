import { StandardItemRate } from '../entities/standard-item-rate.entity';

export const IStandardItemRateRepositoryToken = Symbol('IStandardItemRateRepository');

export interface IStandardItemRateRepository {
  manager: any;
  findAll?(query?: any): Promise<any>;
  findOne?(id: number): Promise<any>;
  create?(data: any): Promise<any>;
  update?(id: number, data: any): Promise<any>;
  remove?(id: number): Promise<void>;
}

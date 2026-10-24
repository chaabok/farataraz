import { Voucher } from '../entities/voucher.entity';

export interface IVoucherRepository {
  create(data: Partial<Voucher>): Promise<Voucher>;
  update(id: number, data: Partial<Voucher>): Promise<Voucher>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Voucher | null>;
  findAll(companyId?: number): Promise<Voucher[]>;
}

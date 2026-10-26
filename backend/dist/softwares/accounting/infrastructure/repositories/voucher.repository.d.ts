import { Repository } from 'typeorm';
import { Voucher } from '../../domain/entities/voucher.entity';
import { IVoucherRepository } from '../../domain/repositories/voucher.repository.interface';
export declare class VoucherRepository implements IVoucherRepository {
    private readonly repository;
    constructor(repository: Repository<Voucher>);
    create(data: Partial<Voucher>): Promise<Voucher>;
    update(id: number, data: Partial<Voucher>): Promise<Voucher>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<Voucher | null>;
    findAll(companyId?: number): Promise<Voucher[]>;
}

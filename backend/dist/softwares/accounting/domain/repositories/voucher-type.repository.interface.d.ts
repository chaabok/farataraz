import { VoucherType } from '../entities/voucher-type.entity';
export interface IVoucherTypeRepository {
    create(data: Partial<VoucherType>): Promise<VoucherType>;
    update(id: number, data: Partial<VoucherType>): Promise<VoucherType>;
    findAll(): Promise<VoucherType[]>;
    findWithPagination(skip: number, take: number): Promise<[VoucherType[], number]>;
    findAdvanced(params: any): Promise<[VoucherType[], number]>;
    findById(id: number): Promise<VoucherType | null>;
    delete(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
export declare const IVoucherTypeRepositoryToken: unique symbol;

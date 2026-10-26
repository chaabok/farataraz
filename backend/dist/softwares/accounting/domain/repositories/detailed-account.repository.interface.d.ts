import { DetailedAccount } from '../entities/detailed-account.entity';
export interface IDetailedAccountRepository {
    create(data: Partial<DetailedAccount>): Promise<DetailedAccount>;
    update(id: number, data: Partial<DetailedAccount>): Promise<DetailedAccount>;
    findAll(): Promise<DetailedAccount[]>;
    findWithPagination(skip: number, take: number): Promise<[DetailedAccount[], number]>;
    findAdvanced(params: any): Promise<[DetailedAccount[], number]>;
    findById(id: number): Promise<DetailedAccount | null>;
    delete(id: number): Promise<void>;
    countByDetailedTypeId(detailedTypesId: number): Promise<number>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
export declare const IDetailedAccountRepositoryToken: unique symbol;

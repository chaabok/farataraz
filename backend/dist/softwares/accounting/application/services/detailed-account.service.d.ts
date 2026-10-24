import { DataSource } from 'typeorm';
import { DetailedAccount } from '../../domain/entities/detailed-account.entity';
import { CreateDetailedAccountDto } from '../dtos/create-detailed-account.dto';
import { UpdateDetailedAccountDto } from '../dtos/update-detailed-account.dto';
import { IDetailedAccountRepository } from '../../domain/repositories/detailed-account.repository.interface';
export declare class DetailedAccountService {
    private readonly detailedAccountRepository;
    private readonly dataSource;
    constructor(detailedAccountRepository: IDetailedAccountRepository, dataSource: DataSource);
    create(createDto: CreateDetailedAccountDto): Promise<DetailedAccount>;
    update(id: number, updateDto: UpdateDetailedAccountDto): Promise<DetailedAccount>;
    findAll(): Promise<DetailedAccount[]>;
    findWithPagination(params: {
        pageIndex: number;
        pageSize: number;
        sorting?: string;
        columnFilters?: string;
        globalFilter?: string;
        advancedFilters?: string;
    }): Promise<{
        items: DetailedAccount[];
        total: number;
    }>;
    findOne(id: number): Promise<DetailedAccount>;
    remove(id: number, manager?: any): Promise<void>;
    removeMany(ids: number[], manager?: any): Promise<void>;
    private executeCleanup;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}

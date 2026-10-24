import { Repository } from 'typeorm';
import { DetailedAccountsNumbering } from '../../domain/entities/detailed-accounts-numbering.entity';
import { IDetailedAccountsNumberingRepository } from '../../domain/repositories/detailed-accounts-numbering.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class DetailedAccountsNumberingRepository implements IDetailedAccountsNumberingRepository {
    private readonly repo;
    private readonly idGenerationService;
    constructor(repo: Repository<DetailedAccountsNumbering>, idGenerationService: IdGenerationService);
    create(data: Partial<DetailedAccountsNumbering>): Promise<DetailedAccountsNumbering>;
    update(id: number, data: Partial<DetailedAccountsNumbering>): Promise<DetailedAccountsNumbering>;
    findAll(): Promise<DetailedAccountsNumbering[]>;
    findByDetailedTypeId(detailedTypesId: number): Promise<DetailedAccountsNumbering | null>;
    upsert(detailedTypesId: number, data: Partial<DetailedAccountsNumbering>): Promise<DetailedAccountsNumbering>;
    deleteByDetailedTypeId(detailedTypesId: number): Promise<void>;
}

import { Repository } from 'typeorm';
import { PettyCash } from '../../domain/entities/petty-cash.entity';
import { IPettyCashRepository } from '../../domain/repositories/petty-cash.repository.interface';
export declare class PettyCashRepository implements IPettyCashRepository {
    private repository;
    constructor(repository: Repository<PettyCash>);
    private calculateCurrentBalance;
    findAll(companyId: number, businessStructureId: number, fiscalYearId: number): Promise<PettyCash[]>;
    findById(id: number, fiscalYearId: number): Promise<PettyCash | null>;
    create(entity: PettyCash): Promise<PettyCash>;
    update(entity: PettyCash): Promise<PettyCash>;
    delete(id: number): Promise<void>;
    isUsed(id: number): Promise<boolean>;
}

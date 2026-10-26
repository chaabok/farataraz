import { PettyCash } from '../entities/petty-cash.entity';
export interface IPettyCashRepository {
    findAll(companyId: number, businessStructureId: number, fiscalYearId: number): Promise<PettyCash[]>;
    findById(id: number, fiscalYearId: number): Promise<PettyCash | null>;
    create(entity: PettyCash): Promise<PettyCash>;
    update(entity: PettyCash): Promise<PettyCash>;
    delete(id: number): Promise<void>;
    isUsed(id: number): Promise<boolean>;
}

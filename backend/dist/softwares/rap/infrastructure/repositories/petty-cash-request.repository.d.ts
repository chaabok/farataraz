import { DataSource } from 'typeorm';
import { PettyCashRequest } from '../../domain/entities/petty-cash-request.entity';
import { IPettyCashRequestRepository } from '../../domain/repositories/petty-cash-request.repository.interface';
export declare class PettyCashRequestRepository implements IPettyCashRequestRepository {
    private dataSource;
    private repository;
    constructor(dataSource: DataSource);
    create(data: Partial<PettyCashRequest>): Promise<PettyCashRequest>;
    update(id: number, data: Partial<PettyCashRequest>): Promise<PettyCashRequest>;
    findById(id: number): Promise<PettyCashRequest>;
    findAll(options: any): Promise<[PettyCashRequest[], number]>;
    delete(id: number): Promise<void>;
    generateNextNumber(businessStructureId: number, companyId: number, fiscalYearId: number): Promise<string>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}

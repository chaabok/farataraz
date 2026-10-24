import { Repository } from 'typeorm';
import { FiscalYear } from '../../domain/entities/fiscal-year.entity';
import { IFiscalYearRepository } from '../../domain/repositories/fiscal-year.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class FiscalYearRepository implements IFiscalYearRepository {
    private readonly repository;
    private readonly requestContextService;
    private readonly idGenerationService;
    constructor(repository: Repository<FiscalYear>, requestContextService: RequestContextService, idGenerationService: IdGenerationService);
    private getScope;
    create(data: Partial<FiscalYear>): Promise<FiscalYear>;
    update(id: number, data: Partial<FiscalYear>): Promise<FiscalYear>;
    findById(id: number): Promise<FiscalYear>;
    findAll(): Promise<FiscalYear[]>;
    findWithPagination(skip: number, take: number): Promise<[FiscalYear[], number]>;
    findAdvanced(params: any): Promise<[FiscalYear[], number]>;
    findByTitle(title: string): Promise<FiscalYear>;
    delete(id: number): Promise<void>;
}

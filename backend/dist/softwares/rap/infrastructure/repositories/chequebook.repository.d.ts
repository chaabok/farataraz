import { Repository } from 'typeorm';
import { Chequebook } from '../../domain/entities/chequebook.entity';
import { IChequebookRepository } from '../../domain/repositories/chequebook.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ChequebookRepository implements IChequebookRepository {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: Repository<Chequebook>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    create(chequebook: Partial<Chequebook>): Promise<Chequebook>;
    update(id: number, chequebook: Partial<Chequebook>): Promise<Chequebook>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<Chequebook | null>;
    findAll(options?: any): Promise<{
        items: Chequebook[];
        total: number;
    }>;
}

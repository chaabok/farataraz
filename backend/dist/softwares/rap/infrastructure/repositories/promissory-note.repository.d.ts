import { Repository } from 'typeorm';
import { PromissoryNote } from '../../domain/entities/promissory-note.entity';
import { PromissoryNoteItem } from '../../domain/entities/promissory-note-item.entity';
import { IPromissoryNoteRepository } from '../../domain/repositories/promissory-note.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class PromissoryNoteRepository implements IPromissoryNoteRepository {
    private readonly repository;
    private readonly itemRepository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: Repository<PromissoryNote>, itemRepository: Repository<PromissoryNoteItem>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<PromissoryNote[]>;
    findWithPagination(params: any): Promise<{
        data: PromissoryNote[];
        total: number;
    }>;
    findById(id: number): Promise<PromissoryNote | null>;
    findUnusedItems(): Promise<PromissoryNoteItem[]>;
    create(data: Partial<PromissoryNote>): Promise<PromissoryNote>;
    update(id: number, data: Partial<PromissoryNote>): Promise<PromissoryNote>;
    delete(id: number): Promise<void>;
}

import { Repository } from 'typeorm';
import { EntityNumbering } from '../../domain/entities/entity-numbering.entity';
import { IEntityNumberingRepository } from '../../domain/repositories/entity-numbering.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class EntityNumberingRepository implements IEntityNumberingRepository {
    private readonly repo;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repo: Repository<EntityNumbering>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    create(data: Partial<EntityNumbering>, businessStructureRef: number, companyRef: number | null): Promise<EntityNumbering>;
    update(id: number, data: Partial<EntityNumbering>): Promise<EntityNumbering>;
    findAll(): Promise<EntityNumbering[]>;
    findByEntityRef(entityRef: string, businessStructureRef: number, companyRef: number | null): Promise<EntityNumbering | null>;
    upsert(entityRef: string, data: Partial<EntityNumbering>, businessStructureRef: number, companyRef: number | null): Promise<EntityNumbering>;
    deleteByEntityRef(entityRef: string, businessStructureRef: number, companyRef: number | null): Promise<void>;
}

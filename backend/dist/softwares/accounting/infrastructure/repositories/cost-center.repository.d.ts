import { Repository } from 'typeorm';
import { CostCenter } from '../../domain/entities/cost-center.entity';
import { ICostCenterRepository } from '../../domain/repositories/cost-center.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class CostCenterRepository implements ICostCenterRepository {
    private readonly typeOrmRepo;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(typeOrmRepo: Repository<CostCenter>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    create(data: Partial<CostCenter>): Promise<CostCenter>;
    update(id: number, data: Partial<CostCenter>): Promise<CostCenter>;
    findAll(): Promise<CostCenter[]>;
    findById(id: number): Promise<CostCenter | null>;
    delete(id: number): Promise<void>;
    findAdvanced(params: any): Promise<[CostCenter[], number]>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    getMaxCode(businessStructureRef: number): Promise<number>;
}

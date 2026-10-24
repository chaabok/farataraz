import { Repository } from 'typeorm';
import { DetailedType } from '../../domain/entities/detailed-type.entity';
import { IDetailedTypeRepository } from '../../domain/repositories/detailed-type.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class DetailedTypeRepository implements IDetailedTypeRepository {
    private readonly typeOrmRepo;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(typeOrmRepo: Repository<DetailedType>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    create(data: Partial<DetailedType>): Promise<DetailedType>;
    update(id: number, data: Partial<DetailedType>): Promise<DetailedType>;
    findAll(): Promise<DetailedType[]>;
    findWithPagination(skip: number, take: number): Promise<[DetailedType[], number]>;
    findAdvanced(params: any): Promise<[DetailedType[], number]>;
    findById(id: number): Promise<DetailedType | null>;
    delete(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}

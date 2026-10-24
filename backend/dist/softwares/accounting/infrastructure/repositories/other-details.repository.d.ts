import { Repository } from 'typeorm';
import { OtherDetails } from '../../domain/entities/other-details.entity';
import { IOtherDetailsRepository } from '../../domain/repositories/other-details.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class OtherDetailsRepository implements IOtherDetailsRepository {
    private readonly typeOrmRepo;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(typeOrmRepo: Repository<OtherDetails>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    create(data: Partial<OtherDetails>): Promise<OtherDetails>;
    update(id: number, data: Partial<OtherDetails>): Promise<OtherDetails>;
    findAll(): Promise<OtherDetails[]>;
    findWithPagination(skip: number, take: number): Promise<[OtherDetails[], number]>;
    findAdvanced(params: any): Promise<[OtherDetails[], number]>;
    findById(id: number): Promise<OtherDetails | null>;
    delete(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}

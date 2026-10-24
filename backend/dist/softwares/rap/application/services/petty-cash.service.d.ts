import { IPettyCashRepository } from '../../domain/repositories/petty-cash.repository.interface';
import { CreatePettyCashDto } from '../dtos/create-petty-cash.dto';
import { UpdatePettyCashDto } from '../dtos/update-petty-cash.dto';
import { PettyCash } from '../../domain/entities/petty-cash.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class PettyCashService {
    private readonly repository;
    private readonly idService;
    private readonly requestContext;
    constructor(repository: IPettyCashRepository, idService: IdGenerationService, requestContext: RequestContextService);
    findAll(): Promise<PettyCash[]>;
    findOne(id: number): Promise<PettyCash>;
    create(dto: CreatePettyCashDto): Promise<PettyCash>;
    update(id: number, dto: UpdatePettyCashDto): Promise<PettyCash>;
    remove(id: number): Promise<void>;
    isUsed(id: number): Promise<boolean>;
}

import { ISettlementMethodRepository } from '../../domain/repositories/settlement-method.repository.interface';
import { SettlementMethod } from '../../domain/entities/settlement-method.entity';
import { CreateSettlementMethodDto, UpdateSettlementMethodDto } from '../dtos/create-settlement-method.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SettlementMethodService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: ISettlementMethodRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<SettlementMethod[]>;
    findById(id: number): Promise<SettlementMethod>;
    getNextNumber(): Promise<{
        documentNumber: number;
        isDocumentNumberAuto: boolean;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    create(dto: CreateSettlementMethodDto): Promise<SettlementMethod>;
    update(id: number, dto: UpdateSettlementMethodDto): Promise<SettlementMethod>;
    remove(id: number): Promise<void>;
}

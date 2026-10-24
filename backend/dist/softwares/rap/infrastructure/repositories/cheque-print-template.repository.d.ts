import { Repository } from 'typeorm';
import { ChequePrintTemplate } from '../../domain/entities/cheque-print-template.entity';
import { IChequePrintTemplateRepository } from '../../domain/repositories/cheque-print-template.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ChequePrintTemplateRepository implements IChequePrintTemplateRepository {
    private readonly repository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<ChequePrintTemplate>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    create(data: Partial<ChequePrintTemplate>): Promise<ChequePrintTemplate>;
    update(id: number, data: Partial<ChequePrintTemplate>): Promise<ChequePrintTemplate>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<ChequePrintTemplate | null>;
    findAll(): Promise<ChequePrintTemplate[]>;
    findAdvanced(params: any): Promise<[ChequePrintTemplate[], number]>;
}

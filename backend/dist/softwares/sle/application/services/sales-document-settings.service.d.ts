import { ISalesDocumentSettingsRepository } from '../../domain/repositories/sales-document-settings.repository.interface';
import { SalesDocumentSettings } from '../../domain/entities/sales-document-settings.entity';
import { CreateSalesDocumentSettingsDto } from '../dtos/create-sales-document-settings.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesDocumentSettingsService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: ISalesDocumentSettingsRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<SalesDocumentSettings[]>;
    findById(id: number): Promise<SalesDocumentSettings>;
    findByType(type: number): Promise<SalesDocumentSettings | null>;
    getDocumentTypes(): {
        id: number;
        title: string;
    }[];
    getBaseDocumentTypes(): {
        id: number;
        title: string;
    }[];
    upsert(dto: CreateSalesDocumentSettingsDto): Promise<SalesDocumentSettings>;
    remove(id: number): Promise<void>;
}

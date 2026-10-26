import { Repository, DataSource } from 'typeorm';
import { DocumentAccountingInfo } from '../../domain/entities/document-accounting-info.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class DocumentAccountingInfoService {
    private readonly repository;
    private readonly requestContextService;
    private readonly idGenerationService;
    private readonly dataSource;
    constructor(repository: Repository<DocumentAccountingInfo>, requestContextService: RequestContextService, idGenerationService: IdGenerationService, dataSource: DataSource);
    getAccountInfoForDocument(documentType: string, documentRef: number): Promise<any[]>;
    getAllByDocument(documentType: string, documentRef: number): Promise<DocumentAccountingInfo[]>;
    getByDocumentWithAccounts(documentType: string, documentRef: number): Promise<{
        items: any[];
    }>;
    saveDefaults(documentType: string, documentRef: number): Promise<void>;
    save(documentType: string, documentRef: number, payload: any): Promise<any>;
}

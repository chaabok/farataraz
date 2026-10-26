import { Repository } from 'typeorm';
import { SalesDocumentSettings } from '../../domain/entities/sales-document-settings.entity';
import { ISalesDocumentSettingsRepository } from '../../domain/repositories/sales-document-settings.repository.interface';
export declare class SalesDocumentSettingsRepository implements ISalesDocumentSettingsRepository {
    private readonly repo;
    constructor(repo: Repository<SalesDocumentSettings>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<SalesDocumentSettings[]>;
    findById(id: number): Promise<SalesDocumentSettings | null>;
    findByType(type: number, businessStructureRef?: number): Promise<SalesDocumentSettings | null>;
    create(entity: SalesDocumentSettings): Promise<SalesDocumentSettings>;
    update(id: number, attrs: Partial<SalesDocumentSettings>): Promise<SalesDocumentSettings>;
    delete(id: number): Promise<void>;
}

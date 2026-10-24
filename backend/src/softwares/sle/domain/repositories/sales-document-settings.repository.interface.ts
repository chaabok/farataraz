import { SalesDocumentSettings } from '../entities/sales-document-settings.entity';

export const ISalesDocumentSettingsRepositoryToken = 'ISalesDocumentSettingsRepository';

export interface ISalesDocumentSettingsRepository {
  manager: any;
  findAll(options?: any): Promise<SalesDocumentSettings[]>;
  findById(id: number): Promise<SalesDocumentSettings | null>;
  findByType(type: number, businessStructureRef?: number): Promise<SalesDocumentSettings | null>;
  create(entity: SalesDocumentSettings): Promise<SalesDocumentSettings>;
  update(id: number, attrs: Partial<SalesDocumentSettings>): Promise<SalesDocumentSettings>;
  delete(id: number): Promise<void>;
}

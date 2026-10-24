import { BaseDocumentService } from '../../application/services/base-document.service';
export declare class BaseDocumentController {
    private readonly baseDocumentService;
    constructor(baseDocumentService: BaseDocumentService);
    getAvailableBaseDocuments(docType: string, targetDocType?: string): Promise<any[]>;
    getBaseDocumentDetails(docType: string, idStr: string, currentDocIdStr?: string, targetDocTypeQuery?: string): Promise<any>;
}

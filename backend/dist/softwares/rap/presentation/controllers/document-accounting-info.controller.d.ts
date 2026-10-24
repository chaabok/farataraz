import { DocumentAccountingInfoService } from '../../application/services/document-accounting-info.service';
export declare class DocumentAccountingInfoController {
    private readonly service;
    constructor(service: DocumentAccountingInfoService);
    getByDocument(documentType: string, documentRef: number): Promise<{
        success: boolean;
        message: string;
    } | {
        items: any[];
        success: boolean;
        message?: undefined;
    }>;
    save(body: any): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
    } | {
        success: boolean;
        data: any;
        message?: undefined;
    }>;
}

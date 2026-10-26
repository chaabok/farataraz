import { SleBaseDocumentService } from '../../application/services/base-document.service';
export declare class SleBaseDocumentController {
    private readonly service;
    constructor(service: SleBaseDocumentService);
    getAvailable(type: string): Promise<{
        success: boolean;
        data: any[];
    }>;
    getDetail(type: string, id: string): Promise<{
        success: boolean;
        data: any;
    }>;
}

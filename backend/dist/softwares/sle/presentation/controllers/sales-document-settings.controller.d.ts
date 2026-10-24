import { SalesDocumentSettingsService } from '../../application/services/sales-document-settings.service';
import { CreateSalesDocumentSettingsDto, UpdateSalesDocumentSettingsDto } from '../../application/dtos/create-sales-document-settings.dto';
export declare class SalesDocumentSettingsController {
    private readonly service;
    constructor(service: SalesDocumentSettingsService);
    getDocumentTypes(): {
        success: boolean;
        data: {
            id: number;
            title: string;
        }[];
    };
    findByType(type: string): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-document-settings.entity").SalesDocumentSettings;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: any[];
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-document-settings.entity").SalesDocumentSettings;
    }>;
    upsert(dto: CreateSalesDocumentSettingsDto): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-document-settings.entity").SalesDocumentSettings;
    }>;
    create(dto: CreateSalesDocumentSettingsDto): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-document-settings.entity").SalesDocumentSettings;
    }>;
    update(id: string, dto: UpdateSalesDocumentSettingsDto): Promise<{
        success: boolean;
        data: import("../../domain/entities/sales-document-settings.entity").SalesDocumentSettings;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

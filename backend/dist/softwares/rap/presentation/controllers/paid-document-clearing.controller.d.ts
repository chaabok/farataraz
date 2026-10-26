import { PaidDocumentClearingService } from '../../application/services/paid-document-clearing.service';
import { CreatePaidDocumentClearingDto } from '../../application/dtos/create-paid-document-clearing.dto';
import { UpdatePaidDocumentClearingDto } from '../../application/dtos/update-paid-document-clearing.dto';
export declare class PaidDocumentClearingController {
    private readonly service;
    constructor(service: PaidDocumentClearingService);
    getNextNumbers(date: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    create(dto: CreatePaidDocumentClearingDto): Promise<{
        data: import("../../domain/entities/paid-document-clearing.entity").PaidDocumentClearing;
    }>;
    update(id: string, dto: UpdatePaidDocumentClearingDto): Promise<{
        data: void;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
    findById(id: string): Promise<{
        data: import("../../domain/entities/paid-document-clearing.entity").PaidDocumentClearing;
    }>;
    findAll(query: any): Promise<{
        data: import("../../domain/entities/paid-document-clearing.entity").PaidDocumentClearing[];
        total: number;
    }>;
}

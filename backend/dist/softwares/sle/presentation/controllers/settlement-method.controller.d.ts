import { SettlementMethodService } from '../../application/services/settlement-method.service';
import { CreateSettlementMethodDto, UpdateSettlementMethodDto } from '../../application/dtos/create-settlement-method.dto';
export declare class SettlementMethodController {
    private readonly service;
    constructor(service: SettlementMethodService);
    findAll(): Promise<{
        data: import("../../domain/entities/settlement-method.entity").SettlementMethod[];
        success: boolean;
    }>;
    getNextNumber(): Promise<{
        data: {
            documentNumber: number;
            isDocumentNumberAuto: boolean;
        };
        success: boolean;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        data: {
            isDuplicate: boolean;
        };
        success: boolean;
    }>;
    create(dto: CreateSettlementMethodDto): Promise<{
        data: import("../../domain/entities/settlement-method.entity").SettlementMethod;
        success: boolean;
        message: string;
    }>;
    update(id: string, dto: UpdateSettlementMethodDto): Promise<{
        data: import("../../domain/entities/settlement-method.entity").SettlementMethod;
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<{
        data: import("../../domain/entities/settlement-method.entity").SettlementMethod;
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

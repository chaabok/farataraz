import { ChequePrintTemplateService } from '../../application/services/cheque-print-template.service';
export declare class ChequePrintTemplateController {
    private readonly service;
    constructor(service: ChequePrintTemplateService);
    create(createDto: any): Promise<import("../../domain/entities/cheque-print-template.entity").ChequePrintTemplate>;
    findAll(): Promise<import("../../domain/entities/cheque-print-template.entity").ChequePrintTemplate[]>;
    findWithPagination(query: any): Promise<{
        items: import("../../domain/entities/cheque-print-template.entity").ChequePrintTemplate[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/cheque-print-template.entity").ChequePrintTemplate>;
    update(id: string, updateDto: any): Promise<import("../../domain/entities/cheque-print-template.entity").ChequePrintTemplate>;
    remove(id: string): Promise<void>;
}

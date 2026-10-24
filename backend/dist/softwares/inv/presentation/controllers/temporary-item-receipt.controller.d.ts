import { TemporaryItemReceiptService } from '../../application/services/temporary-item-receipt.service';
import { CreateTemporaryItemReceiptDto, UpdateTemporaryItemReceiptDto } from '../../application/dtos/temporary-item-receipt.dto';
export declare class TemporaryItemReceiptController {
    private readonly service;
    constructor(service: TemporaryItemReceiptService);
    create(req: any, createDto: CreateTemporaryItemReceiptDto): Promise<import("../../domain/entities/temporary-item-receipt.entity").TemporaryItemReceipt>;
    findAll(req: any, query: any): Promise<import("../../domain/entities/temporary-item-receipt.entity").TemporaryItemReceipt[]>;
    getNextNumber(req: any, type?: string): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/temporary-item-receipt.entity").TemporaryItemReceipt>;
    update(req: any, id: string, updateDto: UpdateTemporaryItemReceiptDto): Promise<import("../../domain/entities/temporary-item-receipt.entity").TemporaryItemReceipt>;
    remove(id: string): Promise<void>;
}

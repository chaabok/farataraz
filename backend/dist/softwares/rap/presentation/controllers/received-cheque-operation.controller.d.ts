import { ReceivedChequeOperationService } from '../../application/services/received-cheque-operation.service';
import { CreateReceivedChequeOperationDto } from '../../application/dtos/create-received-cheque-operation.dto';
import { UpdateReceivedChequeOperationDto } from '../../application/dtos/update-received-cheque-operation.dto';
export declare class ReceivedChequeOperationController {
    private readonly service;
    constructor(service: ReceivedChequeOperationService);
    create(dto: CreateReceivedChequeOperationDto): Promise<{
        data: import("../../domain/entities/received-cheque-operation.entity").ReceivedChequeOperation;
        message: string;
    }>;
    update(id: string, dto: UpdateReceivedChequeOperationDto): Promise<{
        data: import("../../domain/entities/received-cheque-operation.entity").ReceivedChequeOperation;
        message: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getNextNumbers(date: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    findById(id: string): Promise<{
        data: import("../../domain/entities/received-cheque-operation.entity").ReceivedChequeOperation;
    }>;
    findAll(query: any): Promise<{
        data: import("../../domain/entities/received-cheque-operation.entity").ReceivedChequeOperation[];
        total: number;
    }>;
}

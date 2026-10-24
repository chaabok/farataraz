import { Repository } from 'typeorm';
import { ReceivedChequeOperation } from '../../domain/entities/received-cheque-operation.entity';
import { IReceivedChequeOperationRepository } from '../../domain/repositories/received-cheque-operation.repository.interface';
export declare class ReceivedChequeOperationRepository implements IReceivedChequeOperationRepository {
    private readonly repo;
    constructor(repo: Repository<ReceivedChequeOperation>);
    create(data: Partial<ReceivedChequeOperation>): Promise<ReceivedChequeOperation>;
    update(id: number, data: Partial<ReceivedChequeOperation>): Promise<ReceivedChequeOperation>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<ReceivedChequeOperation | null>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
    findAll(filters?: any): Promise<[ReceivedChequeOperation[], number]>;
}

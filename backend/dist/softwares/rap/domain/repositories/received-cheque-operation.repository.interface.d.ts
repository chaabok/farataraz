import { ReceivedChequeOperation } from '../entities/received-cheque-operation.entity';
export declare const IReceivedChequeOperationRepositoryToken: unique symbol;
export interface IReceivedChequeOperationRepository {
    create(data: Partial<ReceivedChequeOperation>): Promise<ReceivedChequeOperation>;
    update(id: number, data: Partial<ReceivedChequeOperation>): Promise<ReceivedChequeOperation>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<ReceivedChequeOperation | null>;
    findAll(filters?: any): Promise<[ReceivedChequeOperation[], number]>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}

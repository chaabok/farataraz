import { PaidDocumentClearing } from '../entities/paid-document-clearing.entity';
export declare const IPaidDocumentClearingRepositoryToken = "IPaidDocumentClearingRepository";
export interface IPaidDocumentClearingRepository {
    create(data: Partial<PaidDocumentClearing>): Promise<PaidDocumentClearing>;
    update(id: number, data: Partial<PaidDocumentClearing>): Promise<void>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<PaidDocumentClearing | null>;
    findAll(): Promise<PaidDocumentClearing[]>;
    findAdvanced(params: any): Promise<[PaidDocumentClearing[], number]>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
    findAllCustom(filters?: any): Promise<[PaidDocumentClearing[], number]>;
    findByIdCustom(id: number): Promise<PaidDocumentClearing | null>;
    manager?: any;
}

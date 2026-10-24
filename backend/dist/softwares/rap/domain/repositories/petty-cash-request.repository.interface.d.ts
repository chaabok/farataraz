export interface IPettyCashRequestRepository {
    create(data: any): Promise<any>;
    update(id: number, data: any): Promise<any>;
    findById(id: number): Promise<any>;
    findAll(options: any): Promise<[any[], number]>;
    delete(id: number): Promise<void>;
    generateNextNumber(businessStructureId: number, companyId: number, fiscalYearId: number): Promise<string>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}

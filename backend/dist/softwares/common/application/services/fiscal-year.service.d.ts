import { IFiscalYearRepository } from '../../domain/repositories/fiscal-year.repository.interface';
import { CreateFiscalYearDto } from '../dtos/create-fiscal-year.dto';
import { UpdateFiscalYearDto } from '../dtos/update-fiscal-year.dto';
export declare class FiscalYearService {
    private readonly repository;
    constructor(repository: IFiscalYearRepository);
    private validateDates;
    checkDuplicateTitle(title: string, excludeId?: number): Promise<{
        isDuplicate: boolean;
    }>;
    create(data: CreateFiscalYearDto, companyId?: number, branchId?: number, agencyId?: number): Promise<any>;
    findAll(): Promise<any[]>;
    findWithPagination(params: {
        pageIndex: number;
        pageSize: number;
        sorting?: string;
        columnFilters?: string;
        globalFilter?: string;
        advancedFilters?: string;
    }): Promise<{
        items: any[];
        total: number;
    }>;
    findOne(id: number): Promise<any>;
    findByTitle(title: string): Promise<any>;
    update(id: number, data: UpdateFiscalYearDto, companyId?: number, branchId?: number, agencyId?: number): Promise<any>;
    remove(id: number): Promise<void>;
}

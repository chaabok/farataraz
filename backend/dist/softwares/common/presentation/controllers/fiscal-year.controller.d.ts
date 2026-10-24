import { FiscalYearService } from '../../application/services/fiscal-year.service';
import { CreateFiscalYearDto } from '../../application/dtos/create-fiscal-year.dto';
import { UpdateFiscalYearDto } from '../../application/dtos/update-fiscal-year.dto';
export declare class FiscalYearController {
    private readonly service;
    constructor(service: FiscalYearService);
    create(createDto: CreateFiscalYearDto, companyId?: string, branchId?: string, agencyId?: string): Promise<any>;
    checkTitle(title: string, id?: string): Promise<{
        isDuplicate: boolean;
    }>;
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<any[]> | Promise<{
        items: any[];
        total: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateFiscalYearDto, companyId?: string, branchId?: string, agencyId?: string): Promise<any>;
    remove(id: string): Promise<void>;
}

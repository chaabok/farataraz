import { BankService } from '../../application/services/bank.service';
import { CreateBankDto } from '../../application/dtos/create-bank.dto';
import { UpdateBankDto } from '../../application/dtos/update-bank.dto';
export declare class BankController {
    private readonly bankService;
    constructor(bankService: BankService);
    create(createBankDto: CreateBankDto): Promise<import("../../domain/entities/bank.entity").Bank>;
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<import("../../domain/entities/bank.entity").Bank[] | {
        items: import("../../domain/entities/bank.entity").Bank[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/bank.entity").Bank>;
    update(id: string, updateBankDto: UpdateBankDto): Promise<import("../../domain/entities/bank.entity").Bank>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        isDuplicate: boolean;
    }>;
}

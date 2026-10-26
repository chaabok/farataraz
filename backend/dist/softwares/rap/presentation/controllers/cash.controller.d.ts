import { CashService } from '../../application/services/cash.service';
import { CreateCashDto } from '../../application/dtos/create-cash.dto';
import { UpdateCashDto } from '../../application/dtos/update-cash.dto';
export declare class CashController {
    private readonly cashService;
    constructor(cashService: CashService);
    create(createCashDto: CreateCashDto): Promise<import("../../domain/entities/cash.entity").Cash>;
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<import("../../domain/entities/cash.entity").Cash[] | {
        items: import("../../domain/entities/cash.entity").Cash[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/cash.entity").Cash>;
    update(id: string, updateCashDto: UpdateCashDto): Promise<import("../../domain/entities/cash.entity").Cash>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        isDuplicate: boolean;
    }>;
}

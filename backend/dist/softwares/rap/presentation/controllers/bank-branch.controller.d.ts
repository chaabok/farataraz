import { BankBranchService } from '../../application/services/bank-branch.service';
import { CreateBankBranchDto } from '../../application/dtos/create-bank-branch.dto';
import { UpdateBankBranchDto } from '../../application/dtos/update-bank-branch.dto';
export declare class BankBranchController {
    private readonly bankBranchService;
    constructor(bankBranchService: BankBranchService);
    create(createBankBranchDto: CreateBankBranchDto): Promise<import("../../domain/entities/bank-branch.entity").BankBranch>;
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<import("../../domain/entities/bank-branch.entity").BankBranch[] | {
        items: import("../../domain/entities/bank-branch.entity").BankBranch[];
        total: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/bank-branch.entity").BankBranch>;
    update(id: string, updateBankBranchDto: UpdateBankBranchDto): Promise<import("../../domain/entities/bank-branch.entity").BankBranch>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        isDuplicate: boolean;
    }>;
}

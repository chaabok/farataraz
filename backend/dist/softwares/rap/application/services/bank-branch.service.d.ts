import { IBankBranchRepository } from '../../domain/repositories/bank-branch.repository.interface';
import { BankBranch } from '../../domain/entities/bank-branch.entity';
import { CreateBankBranchDto } from '../dtos/create-bank-branch.dto';
import { UpdateBankBranchDto } from '../dtos/update-bank-branch.dto';
export declare class BankBranchService {
    private readonly bankBranchRepository;
    constructor(bankBranchRepository: IBankBranchRepository);
    create(createDto: CreateBankBranchDto): Promise<BankBranch>;
    update(id: number, updateDto: UpdateBankBranchDto): Promise<BankBranch>;
    findAll(): Promise<BankBranch[]>;
    findWithPagination(params: any): Promise<{
        items: BankBranch[];
        total: number;
    }>;
    findOne(id: number): Promise<BankBranch>;
    remove(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    private validateDuplicates;
}

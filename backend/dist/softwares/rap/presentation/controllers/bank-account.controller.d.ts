import { BankAccountService } from '../../application/services/bank-account.service';
import { CreateBankAccountDto } from '../../application/dtos/create-bank-account.dto';
import { UpdateBankAccountDto } from '../../application/dtos/update-bank-account.dto';
export declare class BankAccountController {
    private readonly bankAccountService;
    constructor(bankAccountService: BankAccountService);
    create(createDto: CreateBankAccountDto): Promise<import("../../domain/entities/bank-account.entity").BankAccount>;
    findAll(query: any): Promise<{
        items: import("../../domain/entities/bank-account.entity").BankAccount[];
        total: number;
    }>;
    findById(id: string): Promise<import("../../domain/entities/bank-account.entity").BankAccount>;
    update(id: string, updateDto: UpdateBankAccountDto): Promise<import("../../domain/entities/bank-account.entity").BankAccount>;
    remove(id: string): Promise<void>;
}

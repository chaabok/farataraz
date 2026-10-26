import { BankAccountTypeService } from '../../application/services/bank-account-type.service';
import { CreateBankAccountTypeDto } from '../../application/dtos/create-bank-account-type.dto';
import { UpdateBankAccountTypeDto } from '../../application/dtos/update-bank-account-type.dto';
export declare class BankAccountTypeController {
    private readonly service;
    constructor(service: BankAccountTypeService);
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<import("../../domain/entities/bank-account-type.entity").BankAccountType[] | {
        items: import("../../domain/entities/bank-account-type.entity").BankAccountType[];
        total: number;
    }>;
    findById(id: number): Promise<import("../../domain/entities/bank-account-type.entity").BankAccountType>;
    create(dto: CreateBankAccountTypeDto): Promise<import("../../domain/entities/bank-account-type.entity").BankAccountType>;
    update(id: number, dto: UpdateBankAccountTypeDto): Promise<import("../../domain/entities/bank-account-type.entity").BankAccountType>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}

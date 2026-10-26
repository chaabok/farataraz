import { AccountService } from '../../application/services/account.service';
export declare class AccountController {
    private readonly accountService;
    constructor(accountService: AccountService);
    seedDefaultAccounts(body: {
        type?: number;
        group?: number;
        total?: number;
        specific?: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    create(createDto: any): Promise<{
        success: boolean;
        data: import("../../domain/entities/account.entity").Account;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        isDuplicate: boolean;
    }>;
    findAll(query: any): Promise<{
        success: boolean;
        data: import("../../domain/entities/account.entity").Account[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: import("../../domain/entities/account.entity").Account;
    }>;
    update(id: number, updateDto: any): Promise<{
        success: boolean;
        message: string;
        data: import("../../domain/entities/account.entity").Account;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}

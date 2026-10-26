import { ClosingTemporaryAccountService } from '../../application/services/closing-temporary-account.service';
export declare class ClosingTemporaryAccountController {
    private readonly service;
    constructor(service: ClosingTemporaryAccountService);
    getTemporaryAccountsTree(toDate?: string): Promise<{
        success: boolean;
        data: import("../../application/services/closing-temporary-account.service").TemporaryTreeNode;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: import("../../domain/entities/closing-temporary-account.entity").ClosingTemporaryAccount[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: import("../../domain/entities/closing-temporary-account.entity").ClosingTemporaryAccount;
    }>;
    create(dto: any): Promise<{
        success: boolean;
        data: import("../../domain/entities/closing-temporary-account.entity").ClosingTemporaryAccount;
        message: string;
    }>;
    update(id: number, dto: any): Promise<{
        success: boolean;
        data: import("../../domain/entities/closing-temporary-account.entity").ClosingTemporaryAccount;
        message: string;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}

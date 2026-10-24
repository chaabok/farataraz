import { DetailedAccountService } from '../../application/services/detailed-account.service';
import { CreateDetailedAccountDto } from '../../application/dtos/create-detailed-account.dto';
import { UpdateDetailedAccountDto } from '../../application/dtos/update-detailed-account.dto';
export declare class DetailedAccountController {
    private readonly detailedAccountService;
    constructor(detailedAccountService: DetailedAccountService);
    create(createDetailedAccountDto: CreateDetailedAccountDto): Promise<{
        message: string;
        data: import("../../domain/entities/detailed-account.entity").DetailedAccount;
    }>;
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<{
        items: import("../../domain/entities/detailed-account.entity").DetailedAccount[];
        total: number;
    }>;
    findOne(id: number): Promise<import("../../domain/entities/detailed-account.entity").DetailedAccount>;
    update(id: number, updateDetailedAccountDto: UpdateDetailedAccountDto): Promise<{
        message: string;
        data: import("../../domain/entities/detailed-account.entity").DetailedAccount;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    bulkDelete(body: {
        ids: number[];
    }): Promise<{
        message: string;
    }>;
}

import { DetailedAccountsNumberingService } from '../../application/services/detailed-accounts-numbering.service';
import { DetailedAccountsNumbering } from '../../domain/entities/detailed-accounts-numbering.entity';
export declare class DetailedAccountsNumberingController {
    private readonly service;
    constructor(service: DetailedAccountsNumberingService);
    getNumbering(): Promise<{
        data: import("../../application/services/detailed-accounts-numbering.service").DetailedAccountsNumberingView[];
    }>;
    getNextCode(detailedTypeId: number): Promise<{
        data: string;
    }>;
    saveNumbering(body: {
        dataList: Partial<DetailedAccountsNumbering>[];
    }): Promise<{
        message: string;
    }>;
}

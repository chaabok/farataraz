import { UsageCheckService } from '../services/usage-check.service';
export declare class UsageCheckController {
    private readonly usageCheckService;
    constructor(usageCheckService: UsageCheckService);
    checkUsage(tableName: string, id: string): Promise<{
        isUsed: boolean;
        usedInEntity?: string;
        usedInTable?: string;
    }>;
}

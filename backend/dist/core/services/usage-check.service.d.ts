import { DataSource } from 'typeorm';
export declare class UsageCheckService {
    private dataSource;
    constructor(dataSource: DataSource);
    isRecordUsed(tableName: string, id: string | number): Promise<{
        isUsed: boolean;
        usedInEntity?: string;
        usedInTable?: string;
    }>;
}

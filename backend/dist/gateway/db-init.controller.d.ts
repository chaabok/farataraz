export declare class DbInitController {
    private readonly logger;
    init(): Promise<{
        success: boolean;
        message?: string;
        verifiedTables?: string[];
        error?: string;
    }>;
}

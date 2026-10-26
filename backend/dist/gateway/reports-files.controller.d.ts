export declare class ReportsFilesController {
    private readonly logger;
    getReport(reportName?: string): any;
    saveReport(data?: any): {
        message: string;
        fileName: any;
        filePath: string;
    };
}

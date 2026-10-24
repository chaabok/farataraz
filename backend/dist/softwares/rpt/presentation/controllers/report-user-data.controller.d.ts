import { ReportUserDataService } from '../../application/services/report-user-data.service';
import { UpsertReportUserDataDto } from '../../application/dtos/upsert-report-user-data.dto';
export declare class ReportUserDataController {
    private readonly reportUserDataService;
    constructor(reportUserDataService: ReportUserDataService);
    upsertData(dto: UpsertReportUserDataDto, req: any): Promise<{
        success: boolean;
    }>;
    getByReportName(reportName: string, req: any): Promise<import("../../domain/entities/report-user-data.entity").ReportUserData[]>;
}

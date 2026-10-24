import { ReportUserDataRepositoryInterface } from '../../domain/repositories/report-user-data.repository.interface';
import { UpsertReportUserDataDto } from '../dtos/upsert-report-user-data.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class ReportUserDataService {
    private readonly reportUserDataRepository;
    private readonly idGenerationService;
    constructor(reportUserDataRepository: ReportUserDataRepositoryInterface, idGenerationService: IdGenerationService);
    upsertData(dto: UpsertReportUserDataDto, authInfo: any): Promise<{
        success: boolean;
    }>;
    getByReportName(reportName: string, authInfo: any): Promise<import("../../domain/entities/report-user-data.entity").ReportUserData[]>;
}

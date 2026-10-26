import { DataSource } from 'typeorm';
import { ReportService } from '../../application/services/report.service';
import { UpsertReportDto } from '../../application/dtos/upsert-report.dto';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ReportController {
    private readonly reportService;
    private readonly baseSettingsService;
    private readonly requestContext;
    private readonly dataSource;
    constructor(reportService: ReportService, baseSettingsService: BaseSettingsService, requestContext: RequestContextService, dataSource: DataSource);
    findAll(targetForm?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    create(dto: UpsertReportDto): Promise<any>;
    update(id: string, dto: UpsertReportDto): Promise<any>;
    remove(id: string): Promise<void>;
}

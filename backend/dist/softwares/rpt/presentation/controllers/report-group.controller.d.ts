import { DataSource } from 'typeorm';
import { ReportGroupService } from '../../application/services/report-group.service';
import { UpsertReportGroupDto } from '../../application/dtos/upsert-report-group.dto';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ReportGroupController {
    private readonly reportGroupService;
    private readonly baseSettingsService;
    private readonly requestContext;
    private readonly dataSource;
    constructor(reportGroupService: ReportGroupService, baseSettingsService: BaseSettingsService, requestContext: RequestContextService, dataSource: DataSource);
    findAll(): Promise<any>;
    findOne(id: string): Promise<import("../../domain/entities/report-group.entity").ReportGroup>;
    create(dto: UpsertReportGroupDto): Promise<import("../../domain/entities/report-group.entity").ReportGroup>;
    update(id: string, dto: UpsertReportGroupDto): Promise<import("../../domain/entities/report-group.entity").ReportGroup>;
    remove(id: string): Promise<void>;
}

import { UpsertReportGroupDto } from '../dtos/upsert-report-group.dto';
import { IReportGroupRepository } from '../../domain/repositories/report-group.repository.interface';
import { ReportGroup } from '../../domain/entities/report-group.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class ReportGroupService {
    private readonly reportGroupRepository;
    private readonly idGenerationService;
    constructor(reportGroupRepository: IReportGroupRepository, idGenerationService: IdGenerationService);
    findAll(companyRef?: string, businessStructureRef?: string): Promise<ReportGroup[]>;
    findById(id: string): Promise<ReportGroup | null>;
    upsert(dto: UpsertReportGroupDto, companyRef: string, businessStructureRef: string): Promise<ReportGroup>;
    delete(id: string): Promise<void>;
}

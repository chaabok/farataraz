import { ISalesTrackingFactorSettingRepository } from '../../domain/repositories/sales-tracking-factor-setting.repository.interface';
import { UpsertSalesTrackingFactorSettingDto } from '../dtos/create-sales-tracking-factor-setting.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export interface SalesTrackingFactorSettingView {
    SalesDocumentType: number;
    SalesDocumentTypeName: string;
    ShowTrackingFactor: boolean;
}
export declare class SalesTrackingFactorSettingService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: ISalesTrackingFactorSettingRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getSettings(): Promise<SalesTrackingFactorSettingView[]>;
    upsertMany(settings: UpsertSalesTrackingFactorSettingDto[]): Promise<SalesTrackingFactorSettingView[]>;
}

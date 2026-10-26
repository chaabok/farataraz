import { ISalesChannelRepository } from '../../domain/repositories/sales-channel.repository.interface';
import { SalesChannel } from '../../domain/entities/sales-channel.entity';
import { CreateSalesChannelDto, UpdateSalesChannelDto } from '../dtos/create-sales-channel.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesChannelService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: ISalesChannelRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<SalesChannel[]>;
    findById(id: number): Promise<SalesChannel>;
    getNextNumber(): Promise<{
        documentNumber: number;
        isDocumentNumberAuto: boolean;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    create(dto: CreateSalesChannelDto): Promise<SalesChannel>;
    update(id: number, dto: UpdateSalesChannelDto): Promise<SalesChannel>;
    remove(id: number): Promise<void>;
}

import { IDeliveryLocationRepository } from '../../domain/repositories/delivery-location.repository.interface';
import { DeliveryLocation } from '../../domain/entities/delivery-location.entity';
import { CreateDeliveryLocationDto, UpdateDeliveryLocationDto } from '../dtos/create-delivery-location.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class DeliveryLocationService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: IDeliveryLocationRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<DeliveryLocation[]>;
    findById(id: number): Promise<DeliveryLocation>;
    getNextNumber(): Promise<{
        documentNumber: number;
        isDocumentNumberAuto: boolean;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    create(dto: CreateDeliveryLocationDto): Promise<DeliveryLocation>;
    update(id: number, dto: UpdateDeliveryLocationDto): Promise<DeliveryLocation>;
    remove(id: number): Promise<void>;
}

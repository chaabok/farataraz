import { ITrackingFactorRepository } from '../../domain/repositories/tracking-factor.repository.interface';
import { TrackingFactor } from '../../domain/entities/tracking-factor.entity';
import { CreateTrackingFactorDto, UpdateTrackingFactorDto } from '../dtos/tracking-factor.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class TrackingFactorService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: ITrackingFactorRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    private validateDuplicates;
    create(dto: CreateTrackingFactorDto): Promise<TrackingFactor>;
    update(id: number, dto: UpdateTrackingFactorDto): Promise<TrackingFactor>;
    private saveConstantValues;
    private extractRelatedItemIds;
    findAll(query: any): Promise<any>;
    findOne(id: number): Promise<TrackingFactor>;
    remove(id: number): Promise<void>;
    getNextNumber(): Promise<{
        documentNumber: number;
        nextPriority: number;
    }>;
    getNextPriority(): Promise<{
        nextPriority: number;
    }>;
    getAvailableItems(trackingFactorId?: number): Promise<any[]>;
    validateRange(body: {
        userStart?: string;
        userEnd?: string;
        baseStart?: string;
        baseEnd?: string;
        factorName?: string;
    }): Promise<{
        valid: boolean;
        message: string;
    }>;
}

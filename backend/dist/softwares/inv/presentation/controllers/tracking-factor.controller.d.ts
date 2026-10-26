import { TrackingFactorService } from '../../application/services/tracking-factor.service';
import { CreateTrackingFactorDto, UpdateTrackingFactorDto } from '../../application/dtos/tracking-factor.dto';
export declare class TrackingFactorController {
    private readonly service;
    constructor(service: TrackingFactorService);
    getNextNumber(): Promise<{
        documentNumber: number;
        nextPriority: number;
    }>;
    getNextPriority(): Promise<{
        nextPriority: number;
    }>;
    getAvailableItems(trackingFactorId?: string): Promise<any[]>;
    validateRange(body: any): Promise<{
        valid: boolean;
        message: string;
    }>;
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<import("../../domain/entities/tracking-factor.entity").TrackingFactor>;
    create(dto: CreateTrackingFactorDto): Promise<import("../../domain/entities/tracking-factor.entity").TrackingFactor>;
    update(id: string, dto: UpdateTrackingFactorDto): Promise<import("../../domain/entities/tracking-factor.entity").TrackingFactor>;
    remove(id: string): Promise<void>;
}

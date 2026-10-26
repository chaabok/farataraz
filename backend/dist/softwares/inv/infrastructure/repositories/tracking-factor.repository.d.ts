import { Repository } from 'typeorm';
import { TrackingFactor } from '../../domain/entities/tracking-factor.entity';
import { ITrackingFactorRepository } from '../../domain/repositories/tracking-factor.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class TrackingFactorRepository implements ITrackingFactorRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<TrackingFactor>, requestContextService: RequestContextService);
    get manager(): import("typeorm").EntityManager;
    private getScope;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    checkDuplicateCode(code: number, excludeId?: number): Promise<boolean>;
    checkDuplicatePriority(priority: number, excludeId?: number): Promise<boolean>;
    checkDuplicateName(name: string, excludeId?: number): Promise<boolean>;
    checkDuplicateName2(name2: string, excludeId?: number): Promise<boolean>;
    findAll(criteria?: any): Promise<TrackingFactor[]>;
    findById(id: number): Promise<TrackingFactor | null>;
    create(entity: Partial<TrackingFactor>): Promise<TrackingFactor>;
    update(id: number, entity: Partial<TrackingFactor>): Promise<TrackingFactor>;
    delete(id: number): Promise<void>;
    count(criteria?: any): Promise<number>;
    calculateNextCode(): Promise<number>;
    calculateNextPriority(): Promise<number>;
}

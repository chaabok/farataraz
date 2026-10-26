import { Repository } from 'typeorm';
import { MeasurementUnit } from '../../domain/entities/measurement-unit.entity';
import { IMeasurementUnitRepository } from '../../domain/repositories/measurement-unit.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class MeasurementUnitRepository implements IMeasurementUnitRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<MeasurementUnit>, requestContextService: RequestContextService);
    get manager(): import("typeorm").EntityManager;
    private getScope;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findAll(criteria?: any): Promise<MeasurementUnit[]>;
    findById(id: number): Promise<MeasurementUnit>;
    create(entity: Partial<MeasurementUnit>): Promise<MeasurementUnit>;
    update(id: number, entity: Partial<MeasurementUnit>): Promise<MeasurementUnit>;
    delete(id: number): Promise<void>;
    count(criteria?: any): Promise<number>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}

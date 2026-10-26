import { IMeasurementUnitRepository } from '../../domain/repositories/measurement-unit.repository.interface';
import { MeasurementUnit } from '../../domain/entities/measurement-unit.entity';
import { CreateMeasurementUnitDto } from '../dtos/create-measurement-unit.dto';
import { UpdateMeasurementUnitDto } from '../dtos/update-measurement-unit.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class MeasurementUnitService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: IMeasurementUnitRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(query: any): Promise<any>;
    findOne(id: number): Promise<MeasurementUnit>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    private validateDuplicates;
    create(createDto: CreateMeasurementUnitDto): Promise<MeasurementUnit>;
    update(id: number, updateDto: UpdateMeasurementUnitDto): Promise<MeasurementUnit>;
    remove(id: number): Promise<void>;
}

import { MeasurementUnitService } from '../../application/services/measurement-unit.service';
import { CreateMeasurementUnitDto } from '../../application/dtos/create-measurement-unit.dto';
import { UpdateMeasurementUnitDto } from '../../application/dtos/update-measurement-unit.dto';
export declare class MeasurementUnitController {
    private readonly service;
    constructor(service: MeasurementUnitService);
    create(createDto: CreateMeasurementUnitDto): Promise<import("../../domain/entities/measurement-unit.entity").MeasurementUnit>;
    findAll(query: any): Promise<any>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/measurement-unit.entity").MeasurementUnit>;
    update(id: string, updateDto: UpdateMeasurementUnitDto): Promise<import("../../domain/entities/measurement-unit.entity").MeasurementUnit>;
    remove(id: string): Promise<void>;
}

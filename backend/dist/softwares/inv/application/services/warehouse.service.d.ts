import { IWarehouseRepository } from '../../domain/repositories/warehouse.repository.interface';
import { CreateWarehouseDto } from '../dtos/create-warehouse.dto';
import { UpdateWarehouseDto } from '../dtos/update-warehouse.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { UsageCheckService } from '../../../../core/services/usage-check.service';
import { Warehouse } from '../../domain/entities/warehouse.entity';
export declare class WarehouseService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly usageCheckService;
    constructor(repository: IWarehouseRepository, idGenerationService: IdGenerationService, usageCheckService: UsageCheckService);
    findAll(businessStructureRef: number, companyRef: number): Promise<Warehouse[]>;
    findById(id: number, businessStructureRef: number, companyRef: number): Promise<Warehouse>;
    getNextNumber(businessStructureRef?: number, companyRef?: number): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    private validateWarehouse;
    private validateDuplicates;
    create(createDto: CreateWarehouseDto, businessStructureRef: number, companyRef: number, userRef: number): Promise<Warehouse>;
    update(id: number, updateDto: UpdateWarehouseDto, businessStructureRef: number, companyRef: number, userRef: number): Promise<Warehouse>;
    remove(id: number, businessStructureRef: number, companyRef: number): Promise<void>;
}

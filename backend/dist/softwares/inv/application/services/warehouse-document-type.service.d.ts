import { IWarehouseDocumentTypeRepository } from '../../domain/repositories/warehouse-document-type.repository.interface';
import { WarehouseDocumentType } from '../../domain/entities/warehouse-document-type.entity';
import { CreateWarehouseDocumentTypeDto } from '../dtos/create-warehouse-document-type.dto';
import { UpdateWarehouseDocumentTypeDto } from '../dtos/update-warehouse-document-type.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class WarehouseDocumentTypeService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: IWarehouseDocumentTypeRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    findAll(query: any): Promise<any>;
    findOne(id: number): Promise<WarehouseDocumentType>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    private validateFields;
    private validateDuplicates;
    create(createDto: CreateWarehouseDocumentTypeDto): Promise<WarehouseDocumentType>;
    update(id: number, updateDto: UpdateWarehouseDocumentTypeDto): Promise<WarehouseDocumentType>;
    remove(id: number): Promise<void>;
}

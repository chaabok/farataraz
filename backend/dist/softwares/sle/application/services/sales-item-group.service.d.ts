import { ISalesItemGroupRepository } from '../../domain/repositories/sales-item-group.repository.interface';
import { CreateSalesItemGroupDto, UpdateSalesItemGroupDto } from '../dtos/sales-item-group.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesItemGroupService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: ISalesItemGroupRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    private ensureDefaultTree;
    private cleanupDuplicateRows;
    getTree(search?: string): Promise<any>;
    saveTree(treeData: any): Promise<any>;
    private findByParentAndCode;
    findAll(query: any): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: CreateSalesItemGroupDto): Promise<any>;
    update(id: number, dto: UpdateSalesItemGroupDto): Promise<any>;
    remove(id: number): Promise<void>;
}

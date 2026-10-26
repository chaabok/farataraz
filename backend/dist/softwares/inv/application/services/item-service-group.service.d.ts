import { IItemServiceGroupRepository } from '../../domain/repositories/item-service-group.repository.interface';
import { ItemServiceGroup } from '../../domain/entities/item-service-group.entity';
import { CreateItemServiceGroupDto, UpdateItemServiceGroupDto } from '../dtos/item-service-group.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ItemServiceGroupService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: IItemServiceGroupRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    private ensureDefaultTree;
    private cleanupDuplicateRows;
    getTree(search?: string): Promise<any>;
    private validateTreeDuplicates;
    private validateDuplicates;
    saveTree(treeData: any): Promise<any>;
    create(dto: CreateItemServiceGroupDto): Promise<ItemServiceGroup>;
    update(id: number, dto: UpdateItemServiceGroupDto): Promise<ItemServiceGroup>;
    findAll(query: any): Promise<any>;
    findOne(id: number): Promise<ItemServiceGroup>;
    remove(id: number): Promise<void>;
}

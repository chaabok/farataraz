import { IItemAccountCategoryRepository } from '../../domain/repositories/item-account-category.repository.interface';
import { ItemAccountCategory } from '../../domain/entities/item-account-category.entity';
import { CreateItemAccountCategoryDto } from '../dtos/create-item-account-category.dto';
import { UpdateItemAccountCategoryDto } from '../dtos/update-item-account-category.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ItemAccountCategoryService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: IItemAccountCategoryRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(query: any): Promise<any>;
    getItemsByCategory(categoryId: number): Promise<any[]>;
    updateCategoryItems(categoryId: number, items: any[]): Promise<void>;
    findOne(id: number): Promise<any>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    private validateDuplicates;
    create(createDto: CreateItemAccountCategoryDto): Promise<ItemAccountCategory>;
    update(id: number, updateDto: UpdateItemAccountCategoryDto): Promise<ItemAccountCategory>;
    remove(id: number): Promise<void>;
}

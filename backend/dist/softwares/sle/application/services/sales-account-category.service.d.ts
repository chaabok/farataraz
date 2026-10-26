import { ISalesAccountCategoryRepository } from '../../domain/repositories/sales-account-category.repository.interface';
import { SalesAccountCategory } from '../../domain/entities/sales-account-category.entity';
import { CreateSalesAccountCategoryDto } from '../dtos/create-sales-account-category.dto';
import { UpdateSalesAccountCategoryDto } from '../dtos/update-sales-account-category.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesAccountCategoryService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: ISalesAccountCategoryRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(query: any): Promise<any>;
    getItemsByGroup(groupId: number): Promise<any[]>;
    updateGroupItems(groupId: number, items: any[]): Promise<void>;
    findOne(id: number): Promise<any>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    private validateDuplicates;
    create(createDto: CreateSalesAccountCategoryDto): Promise<SalesAccountCategory>;
    update(id: number, updateDto: UpdateSalesAccountCategoryDto): Promise<SalesAccountCategory>;
    remove(id: number): Promise<void>;
}

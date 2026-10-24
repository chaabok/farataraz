import { ItemAccountCategoryService } from '../../application/services/item-account-category.service';
import { CreateItemAccountCategoryDto } from '../../application/dtos/create-item-account-category.dto';
import { UpdateItemAccountCategoryDto } from '../../application/dtos/update-item-account-category.dto';
export declare class ItemAccountCategoryController {
    private readonly service;
    constructor(service: ItemAccountCategoryService);
    create(createDto: CreateItemAccountCategoryDto): Promise<import("../../domain/entities/item-account-category.entity").ItemAccountCategory>;
    findAll(query: any): Promise<any>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateItemAccountCategoryDto): Promise<import("../../domain/entities/item-account-category.entity").ItemAccountCategory>;
    remove(id: string): Promise<void>;
}

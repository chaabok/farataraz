import { SalesAccountCategoryService } from '../../application/services/sales-account-category.service';
import { CreateSalesAccountCategoryDto } from '../../application/dtos/create-sales-account-category.dto';
import { UpdateSalesAccountCategoryDto } from '../../application/dtos/update-sales-account-category.dto';
export declare class SalesAccountCategoryController {
    private readonly service;
    constructor(service: SalesAccountCategoryService);
    findAll(query: any): Promise<any>;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    findOne(id: string): Promise<{
        data: any;
        success: boolean;
    }>;
    create(dto: CreateSalesAccountCategoryDto): Promise<{
        data: import("../../domain/entities/sales-account-category.entity").SalesAccountCategory;
        success: boolean;
    }>;
    update(id: string, dto: UpdateSalesAccountCategoryDto): Promise<{
        data: import("../../domain/entities/sales-account-category.entity").SalesAccountCategory;
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

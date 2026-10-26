import { SalesItemGroupService } from '../../application/services/sales-item-group.service';
import { CreateSalesItemGroupDto, UpdateSalesItemGroupDto, SaveTreeDto } from '../../application/dtos/sales-item-group.dto';
export declare class SalesItemGroupController {
    private readonly service;
    constructor(service: SalesItemGroupService);
    getTree(search?: string): Promise<{
        data: any;
        success: boolean;
    }>;
    saveTree(body: SaveTreeDto): Promise<{
        data: any;
        success: boolean;
    }>;
    create(createDto: CreateSalesItemGroupDto): Promise<any>;
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateSalesItemGroupDto): Promise<any>;
    remove(id: string): Promise<void>;
}

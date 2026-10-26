import { ItemServiceGroupService } from '../../application/services/item-service-group.service';
import { SaveTreeDto, CreateItemServiceGroupDto, UpdateItemServiceGroupDto } from '../../application/dtos/item-service-group.dto';
export declare class ItemServiceGroupController {
    private readonly service;
    constructor(service: ItemServiceGroupService);
    getTree(search?: string): Promise<{
        data: any;
        success: boolean;
    }>;
    saveTree(body: SaveTreeDto): Promise<{
        data: any;
        success: boolean;
    }>;
    create(dto: CreateItemServiceGroupDto): Promise<{
        data: import("../../domain/entities/item-service-group.entity").ItemServiceGroup;
        success: boolean;
        message: string;
    }>;
    update(id: string, dto: UpdateItemServiceGroupDto): Promise<{
        data: import("../../domain/entities/item-service-group.entity").ItemServiceGroup;
        success: boolean;
        message: string;
    }>;
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<import("../../domain/entities/item-service-group.entity").ItemServiceGroup>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

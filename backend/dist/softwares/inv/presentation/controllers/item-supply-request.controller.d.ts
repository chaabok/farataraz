import { ItemSupplyRequestService } from '../../application/services/item-supply-request.service';
import { CreateItemSupplyRequestDto, UpdateItemSupplyRequestDto } from '../../application/dtos/item-supply-request.dto';
export declare class ItemSupplyRequestController {
    private readonly service;
    constructor(service: ItemSupplyRequestService);
    create(createDto: CreateItemSupplyRequestDto): Promise<import("../../domain/entities/item-supply-request.entity").ItemSupplyRequest>;
    findAll(query: any): Promise<import("../../domain/entities/item-supply-request.entity").ItemSupplyRequest[]>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    getRequesters(): Promise<any[]>;
    findOne(id: string): Promise<import("../../domain/entities/item-supply-request.entity").ItemSupplyRequest>;
    update(id: string, updateDto: UpdateItemSupplyRequestDto): Promise<import("../../domain/entities/item-supply-request.entity").ItemSupplyRequest>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

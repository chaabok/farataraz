import { ItemRequestService } from '../../application/services/item-request.service';
import { CreateItemRequestDto, UpdateItemRequestDto } from '../../application/dtos/item-request.dto';
export declare class ItemRequestController {
    private readonly service;
    constructor(service: ItemRequestService);
    create(createDto: CreateItemRequestDto): Promise<import("../../domain/entities/item-request.entity").ItemRequest>;
    findAll(query: any): Promise<import("../../domain/entities/item-request.entity").ItemRequest[]>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/item-request.entity").ItemRequest>;
    update(id: string, updateDto: UpdateItemRequestDto): Promise<import("../../domain/entities/item-request.entity").ItemRequest>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

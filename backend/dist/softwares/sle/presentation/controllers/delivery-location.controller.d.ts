import { DeliveryLocationService } from '../../application/services/delivery-location.service';
import { CreateDeliveryLocationDto, UpdateDeliveryLocationDto } from '../../application/dtos/create-delivery-location.dto';
export declare class DeliveryLocationController {
    private readonly service;
    constructor(service: DeliveryLocationService);
    findAll(): Promise<{
        data: import("../../domain/entities/delivery-location.entity").DeliveryLocation[];
        success: boolean;
    }>;
    getNextNumber(): Promise<{
        data: {
            documentNumber: number;
            isDocumentNumberAuto: boolean;
        };
        success: boolean;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        data: {
            isDuplicate: boolean;
        };
        success: boolean;
    }>;
    create(dto: CreateDeliveryLocationDto): Promise<{
        data: import("../../domain/entities/delivery-location.entity").DeliveryLocation;
        success: boolean;
        message: string;
    }>;
    update(id: string, dto: UpdateDeliveryLocationDto): Promise<{
        data: import("../../domain/entities/delivery-location.entity").DeliveryLocation;
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<{
        data: import("../../domain/entities/delivery-location.entity").DeliveryLocation;
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

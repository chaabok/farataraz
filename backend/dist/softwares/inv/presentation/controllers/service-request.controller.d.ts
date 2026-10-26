import { ServiceRequestService } from '../../application/services/service-request.service';
import { CreateServiceRequestDto, UpdateServiceRequestDto } from '../../application/dtos/service-request.dto';
export declare class ServiceRequestController {
    private readonly service;
    constructor(service: ServiceRequestService);
    create(createDto: CreateServiceRequestDto): Promise<import("../../domain/entities/service-request.entity").ServiceRequest>;
    findAll(query: any): Promise<import("../../domain/entities/service-request.entity").ServiceRequest[]>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/service-request.entity").ServiceRequest>;
    update(id: string, updateDto: UpdateServiceRequestDto): Promise<import("../../domain/entities/service-request.entity").ServiceRequest>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

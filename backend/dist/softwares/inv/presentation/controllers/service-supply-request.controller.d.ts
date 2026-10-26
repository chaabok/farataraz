import { ServiceSupplyRequestService } from '../../application/services/service-supply-request.service';
import { CreateServiceSupplyRequestDto, UpdateServiceSupplyRequestDto } from '../../application/dtos/service-supply-request.dto';
export declare class ServiceSupplyRequestController {
    private readonly service;
    constructor(service: ServiceSupplyRequestService);
    create(createDto: CreateServiceSupplyRequestDto): Promise<import("../../domain/entities/service-supply-request.entity").ServiceSupplyRequest>;
    findAll(query: any): Promise<import("../../domain/entities/service-supply-request.entity").ServiceSupplyRequest[]>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    getRequesters(): Promise<any[]>;
    findOne(id: string): Promise<import("../../domain/entities/service-supply-request.entity").ServiceSupplyRequest>;
    update(id: string, updateDto: UpdateServiceSupplyRequestDto): Promise<import("../../domain/entities/service-supply-request.entity").ServiceSupplyRequest>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

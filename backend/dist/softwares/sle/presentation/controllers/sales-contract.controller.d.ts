import { SalesContractService } from '../../application/services/sales-contract.service';
import { CreateSalesContractDto, UpdateSalesContractDto } from '../../application/dtos/sales-contract.dto';
export declare class SalesContractController {
    private readonly service;
    constructor(service: SalesContractService);
    create(createDto: CreateSalesContractDto): Promise<import("../../domain/entities/sales-contract.entity").SalesContract>;
    findAll(query: any): Promise<{
        items: import("../../domain/entities/sales-contract.entity").SalesContract[];
        total: number;
    }>;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/sales-contract.entity").SalesContract>;
    update(id: string, updateDto: UpdateSalesContractDto): Promise<import("../../domain/entities/sales-contract.entity").SalesContract>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

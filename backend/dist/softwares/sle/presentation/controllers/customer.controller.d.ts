import { CustomerService } from '../../application/services/customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../../application/dtos/create-customer.dto';
export declare class CustomerController {
    private readonly service;
    constructor(service: CustomerService);
    findAll(): Promise<{
        success: boolean;
        data: import("../../domain/entities/customer.entity").Customer[];
    }>;
    getNextCode(): Promise<{
        success: boolean;
        data: {
            documentNumber: string;
        };
    }>;
    findById(id: string): Promise<{
        success: boolean;
        data: import("../../domain/entities/customer.entity").Customer;
    }>;
    upsert(dto: CreateCustomerDto & {
        CustomerID?: number;
    }): Promise<{
        success: boolean;
        data: import("../../domain/entities/customer.entity").Customer;
    }>;
    create(dto: CreateCustomerDto): Promise<{
        success: boolean;
        data: import("../../domain/entities/customer.entity").Customer;
    }>;
    update(id: string, dto: UpdateCustomerDto): Promise<{
        success: boolean;
        data: import("../../domain/entities/customer.entity").Customer;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

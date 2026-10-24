import { CustomerGroupService } from '../../application/services/customer-group.service';
import { CreateCustomerGroupDto, UpdateCustomerGroupDto } from '../../application/dtos/customer-group.dto';
export declare class CustomerGroupController {
    private readonly service;
    constructor(service: CustomerGroupService);
    findAll(): Promise<{
        data: import("../../domain/entities/customer-group.entity").CustomerGroup[];
        success: boolean;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string, parentRef?: string): Promise<{
        data: {
            isDuplicate: boolean;
        };
        success: boolean;
    }>;
    getNextCode(parentRef?: string): Promise<{
        data: string;
        success: boolean;
    }>;
    getTree(): Promise<{
        data: any;
        success: boolean;
    }>;
    create(dto: CreateCustomerGroupDto): Promise<{
        data: import("../../domain/entities/customer-group.entity").CustomerGroup;
        success: boolean;
        message: string;
    }>;
    upsert(dto: CreateCustomerGroupDto): Promise<{
        data: import("../../domain/entities/customer-group.entity").CustomerGroup;
        success: boolean;
        message: string;
    }>;
    update(id: string, dto: UpdateCustomerGroupDto): Promise<{
        data: import("../../domain/entities/customer-group.entity").CustomerGroup;
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<{
        data: import("../../domain/entities/customer-group.entity").CustomerGroup;
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}

import { WarehouseVouchersPricingService } from '../../application/services/warehouse-vouchers-pricing.service';
import { CreateWarehouseVouchersPricingDto, UpdateWarehouseVouchersPricingDto, CalculateWarehousePricingDto } from '../../application/dtos/warehouse-vouchers-pricing.dto';
export declare class WarehouseVouchersPricingController {
    private readonly service;
    constructor(service: WarehouseVouchersPricingService);
    calculatePricing(dto: CalculateWarehousePricingDto): Promise<{
        success: boolean;
        data: any;
    }>;
    create(dto: CreateWarehouseVouchersPricingDto): Promise<{
        success: boolean;
        data: import("../../domain/entities/warehouse-vouchers-pricing.entity").WarehouseVouchersPricing;
    }>;
    createBatch(dtos: CreateWarehouseVouchersPricingDto[]): Promise<{
        success: boolean;
        data: import("../../domain/entities/warehouse-vouchers-pricing.entity").WarehouseVouchersPricing[];
    }>;
    findAll(query: any): Promise<{
        success: boolean;
        data: import("../../domain/entities/warehouse-vouchers-pricing.entity").WarehouseVouchersPricing[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: import("../../domain/entities/warehouse-vouchers-pricing.entity").WarehouseVouchersPricing;
    }>;
    update(id: number, dto: UpdateWarehouseVouchersPricingDto): Promise<{
        success: boolean;
        data: import("../../domain/entities/warehouse-vouchers-pricing.entity").WarehouseVouchersPricing;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}

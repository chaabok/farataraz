import { SalesChannelService } from '../../application/services/sales-channel.service';
import { CreateSalesChannelDto, UpdateSalesChannelDto } from '../../application/dtos/create-sales-channel.dto';
export declare class SalesChannelController {
    private readonly service;
    constructor(service: SalesChannelService);
    findAll(): Promise<{
        data: import("../../domain/entities/sales-channel.entity").SalesChannel[];
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
    create(dto: CreateSalesChannelDto): Promise<{
        data: import("../../domain/entities/sales-channel.entity").SalesChannel;
        success: boolean;
        message: string;
    }>;
    update(id: string, dto: UpdateSalesChannelDto): Promise<{
        data: import("../../domain/entities/sales-channel.entity").SalesChannel;
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<{
        data: import("../../domain/entities/sales-channel.entity").SalesChannel;
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

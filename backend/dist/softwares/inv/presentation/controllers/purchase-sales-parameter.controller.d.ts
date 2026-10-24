import { PurchaseSalesParameterService } from '../../application/services/purchase-sales-parameter.service';
import { CreatePurchaseSalesParameterDto } from '../../application/dtos/create-purchase-sales-parameter.dto';
import { UpdatePurchaseSalesParameterDto } from '../../application/dtos/update-purchase-sales-parameter.dto';
export declare class PurchaseSalesParameterController {
    private readonly service;
    constructor(service: PurchaseSalesParameterService);
    create(createDto: CreatePurchaseSalesParameterDto): Promise<any>;
    findAll(query: any): Promise<any>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        isDuplicate: boolean;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdatePurchaseSalesParameterDto): Promise<any>;
    remove(id: string): Promise<void>;
}

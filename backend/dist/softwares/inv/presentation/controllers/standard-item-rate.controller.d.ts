import { StandardItemRateService } from '../../application/services/standard-item-rate.service';
import { CreateStandardItemRateDto } from '../../application/dtos/create-standard-item-rate.dto';
import { UpdateStandardItemRateDto } from '../../application/dtos/update-standard-item-rate.dto';
export declare class StandardItemRateController {
    private readonly service;
    constructor(service: StandardItemRateService);
    create(createDto: CreateStandardItemRateDto): Promise<any>;
    findAll(query: any): Promise<any>;
    getItemsByCategory(categoryId: string, rateId?: string): Promise<any[]>;
    validateEffectiveDate(categoryId: string, effectiveDate: string, excludeId?: string): Promise<{
        valid: boolean;
        message?: string;
        maxEffectiveDate?: string;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, updateDto: UpdateStandardItemRateDto): Promise<any>;
    remove(id: string): Promise<void>;
}

import { Repository } from 'typeorm';
import { PurchaseSalesParameter } from '../../domain/entities/purchase-sales-parameter.entity';
import { IPurchaseSalesParameterRepository } from '../../domain/repositories/purchase-sales-parameter.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class PurchaseSalesParameterRepository implements IPurchaseSalesParameterRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<PurchaseSalesParameter>, requestContextService: RequestContextService);
    get manager(): import("typeorm").EntityManager;
    private getScope;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findAll(criteria?: any): Promise<PurchaseSalesParameter[]>;
    findById(id: number): Promise<PurchaseSalesParameter | null>;
    create(entity: Partial<PurchaseSalesParameter>): Promise<PurchaseSalesParameter>;
    update(id: number, entity: Partial<PurchaseSalesParameter>): Promise<PurchaseSalesParameter>;
    delete(id: number): Promise<void>;
}

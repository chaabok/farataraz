import { Repository } from 'typeorm';
import { ICashierRepository } from '../../domain/repositories/cashier.repository.interface';
import { Cashier } from '../../domain/entities/cashier.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class CashierRepository implements ICashierRepository {
    private readonly typeOrmRepo;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(typeOrmRepo: Repository<Cashier>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    create(data: Partial<Cashier>): Promise<Cashier>;
    update(id: number, data: Partial<Cashier>): Promise<Cashier>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<Cashier | null>;
    findByCashId(cashId: number): Promise<Cashier[]>;
}

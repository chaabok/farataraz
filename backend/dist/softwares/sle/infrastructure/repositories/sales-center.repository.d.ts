import { Repository } from 'typeorm';
import { SalesCenter } from '../../domain/entities/sales-center.entity';
import { ISalesCenterRepository } from '../../domain/repositories/sales-center.repository.interface';
export declare class SalesCenterRepository implements ISalesCenterRepository {
    private readonly repo;
    constructor(repo: Repository<SalesCenter>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<SalesCenter[]>;
    findById(id: number): Promise<SalesCenter | null>;
    create(entity: SalesCenter): Promise<SalesCenter>;
    update(id: number, attrs: Partial<SalesCenter>): Promise<SalesCenter>;
    delete(id: number): Promise<void>;
}

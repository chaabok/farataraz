import { Repository } from 'typeorm';
import { SalesType } from '../../domain/entities/sales-type.entity';
import { ISalesTypeRepository } from '../../domain/repositories/sales-type.repository.interface';
export declare class SalesTypeRepository implements ISalesTypeRepository {
    private readonly repo;
    constructor(repo: Repository<SalesType>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<SalesType[]>;
    findById(id: number): Promise<SalesType | null>;
    create(entity: SalesType): Promise<SalesType>;
    update(id: number, attrs: Partial<SalesType>): Promise<SalesType>;
    delete(id: number): Promise<void>;
}

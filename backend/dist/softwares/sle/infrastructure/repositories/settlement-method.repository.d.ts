import { Repository } from 'typeorm';
import { SettlementMethod } from '../../domain/entities/settlement-method.entity';
import { ISettlementMethodRepository } from '../../domain/repositories/settlement-method.repository.interface';
export declare class SettlementMethodRepository implements ISettlementMethodRepository {
    private readonly repo;
    constructor(repo: Repository<SettlementMethod>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<SettlementMethod[]>;
    findById(id: number): Promise<SettlementMethod | null>;
    create(entity: SettlementMethod): Promise<SettlementMethod>;
    update(id: number, attrs: Partial<SettlementMethod>): Promise<SettlementMethod>;
    delete(id: number): Promise<void>;
}

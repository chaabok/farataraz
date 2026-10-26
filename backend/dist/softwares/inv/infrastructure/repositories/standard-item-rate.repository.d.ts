import { Repository } from 'typeorm';
import { StandardItemRate } from '../../domain/entities/standard-item-rate.entity';
import { IStandardItemRateRepository } from '../../domain/repositories/standard-item-rate.repository.interface';
export declare class StandardItemRateRepository implements IStandardItemRateRepository {
    private readonly repository;
    constructor(repository: Repository<StandardItemRate>);
    get manager(): import("typeorm").EntityManager;
}

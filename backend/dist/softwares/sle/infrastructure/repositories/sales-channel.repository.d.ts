import { Repository } from 'typeorm';
import { SalesChannel } from '../../domain/entities/sales-channel.entity';
import { ISalesChannelRepository } from '../../domain/repositories/sales-channel.repository.interface';
export declare class SalesChannelRepository implements ISalesChannelRepository {
    private readonly repo;
    constructor(repo: Repository<SalesChannel>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<SalesChannel[]>;
    findById(id: number): Promise<SalesChannel | null>;
    create(entity: SalesChannel): Promise<SalesChannel>;
    update(id: number, attrs: Partial<SalesChannel>): Promise<SalesChannel>;
    delete(id: number): Promise<void>;
}

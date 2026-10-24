import { SalesChannel } from '../entities/sales-channel.entity';
export interface ISalesChannelRepository {
    findAll(options?: any): Promise<SalesChannel[]>;
    findById(id: number): Promise<SalesChannel | null>;
    create(entity: SalesChannel): Promise<SalesChannel>;
    update(id: number, attrs: Partial<SalesChannel>): Promise<SalesChannel>;
    delete(id: number): Promise<void>;
    manager: any;
}
export declare const ISalesChannelRepositoryToken: unique symbol;

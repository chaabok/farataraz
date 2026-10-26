import { Repository } from 'typeorm';
import { DeliveryLocation } from '../../domain/entities/delivery-location.entity';
import { IDeliveryLocationRepository } from '../../domain/repositories/delivery-location.repository.interface';
export declare class DeliveryLocationRepository implements IDeliveryLocationRepository {
    private readonly repo;
    constructor(repo: Repository<DeliveryLocation>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<DeliveryLocation[]>;
    findById(id: number): Promise<DeliveryLocation | null>;
    create(entity: DeliveryLocation): Promise<DeliveryLocation>;
    update(id: number, attrs: Partial<DeliveryLocation>): Promise<DeliveryLocation>;
    delete(id: number): Promise<void>;
}

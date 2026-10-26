import { DeliveryLocation } from '../entities/delivery-location.entity';
export interface IDeliveryLocationRepository {
    findAll(options?: any): Promise<DeliveryLocation[]>;
    findById(id: number): Promise<DeliveryLocation | null>;
    create(entity: DeliveryLocation): Promise<DeliveryLocation>;
    update(id: number, attrs: Partial<DeliveryLocation>): Promise<DeliveryLocation>;
    delete(id: number): Promise<void>;
    manager: any;
}
export declare const IDeliveryLocationRepositoryToken: unique symbol;

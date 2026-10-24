import { SalesCenter } from '../entities/sales-center.entity';
export interface ISalesCenterRepository {
    findAll(options?: any): Promise<SalesCenter[]>;
    findById(id: number): Promise<SalesCenter | null>;
    create(entity: SalesCenter): Promise<SalesCenter>;
    update(id: number, attrs: Partial<SalesCenter>): Promise<SalesCenter>;
    delete(id: number): Promise<void>;
    manager: any;
}
export declare const ISalesCenterRepositoryToken: unique symbol;

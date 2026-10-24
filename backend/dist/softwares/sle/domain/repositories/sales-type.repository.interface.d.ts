import { SalesType } from '../entities/sales-type.entity';
export declare const ISalesTypeRepositoryToken = "ISalesTypeRepository";
export interface ISalesTypeRepository {
    manager: any;
    findAll(options?: any): Promise<SalesType[]>;
    findById(id: number): Promise<SalesType | null>;
    create(entity: SalesType): Promise<SalesType>;
    update(id: number, attrs: Partial<SalesType>): Promise<SalesType>;
    delete(id: number): Promise<void>;
}

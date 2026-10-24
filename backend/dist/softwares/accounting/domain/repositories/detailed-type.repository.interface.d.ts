import { DetailedType } from '../entities/detailed-type.entity';
export interface IDetailedTypeRepository {
    create(data: Partial<DetailedType>): Promise<DetailedType>;
    update(id: number, data: Partial<DetailedType>): Promise<DetailedType>;
    findAll(): Promise<DetailedType[]>;
    findWithPagination(skip: number, take: number): Promise<[DetailedType[], number]>;
    findAdvanced(params: any): Promise<[DetailedType[], number]>;
    findById(id: number): Promise<DetailedType | null>;
    delete(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
export declare const IDetailedTypeRepositoryToken: unique symbol;

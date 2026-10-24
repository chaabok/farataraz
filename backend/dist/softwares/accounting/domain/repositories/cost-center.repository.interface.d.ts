import { CostCenter } from '../entities/cost-center.entity';
export declare const ICostCenterRepositoryToken: unique symbol;
export interface ICostCenterRepository {
    create(data: Partial<CostCenter>): Promise<CostCenter>;
    update(id: number, data: Partial<CostCenter>): Promise<CostCenter>;
    findAll(): Promise<CostCenter[]>;
    findById(id: number): Promise<CostCenter | null>;
    delete(id: number): Promise<void>;
    findAdvanced(params: any): Promise<[CostCenter[], number]>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    getMaxCode(businessStructureRef: number): Promise<number>;
}

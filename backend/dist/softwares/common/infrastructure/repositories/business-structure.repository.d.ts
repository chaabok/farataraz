import { Repository } from 'typeorm';
import { BusinessStructure } from '../../domain/entities/business-structure.entity';
import { IBusinessStructureRepository } from '../../domain/repositories/business-structure.repository.interface';
export declare class BusinessStructureRepository implements IBusinessStructureRepository {
    readonly repo: Repository<BusinessStructure>;
    constructor(repo: Repository<BusinessStructure>);
    create(businessStructure: Partial<BusinessStructure>): Promise<BusinessStructure>;
    findAll(): Promise<BusinessStructure[]>;
    findById(id: number): Promise<BusinessStructure | null>;
    update(id: number, businessStructure: Partial<BusinessStructure>): Promise<BusinessStructure>;
    delete(id: number): Promise<void>;
    count(): Promise<number>;
    updateAllSharing(isShared: boolean): Promise<void>;
}

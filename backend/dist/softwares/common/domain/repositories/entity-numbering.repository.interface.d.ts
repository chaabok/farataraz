import { EntityNumbering } from '../entities/entity-numbering.entity';
export interface IEntityNumberingRepository {
    create(data: Partial<EntityNumbering>, businessStructureRef: number, companyRef: number | null): Promise<EntityNumbering>;
    update(id: number, data: Partial<EntityNumbering>): Promise<EntityNumbering>;
    findAll(): Promise<EntityNumbering[]>;
    findByEntityRef(entityRef: string, businessStructureRef: number, companyRef: number | null): Promise<EntityNumbering | null>;
    upsert(entityRef: string, data: Partial<EntityNumbering>, businessStructureRef: number, companyRef: number | null): Promise<EntityNumbering>;
    deleteByEntityRef(entityRef: string, businessStructureRef: number, companyRef: number | null): Promise<void>;
}
export declare const IEntityNumberingRepositoryToken: unique symbol;

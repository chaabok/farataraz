import { BusinessStructure } from '../entities/business-structure.entity';

export interface IBusinessStructureRepository {
  create(businessStructure: Partial<BusinessStructure>): Promise<BusinessStructure>;
  findAll(): Promise<BusinessStructure[]>;
  findById(id: number): Promise<BusinessStructure | null>;
  update(id: number, businessStructure: Partial<BusinessStructure>): Promise<BusinessStructure>;
  delete(id: number): Promise<void>;
  count(): Promise<number>;
  updateAllSharing?(isShared: boolean): Promise<void>;
}

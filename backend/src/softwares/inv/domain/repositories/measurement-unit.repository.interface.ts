import { MeasurementUnit } from '../entities/measurement-unit.entity';

export interface IMeasurementUnitRepository {
  findAll(criteria?: any): Promise<MeasurementUnit[]>;
  findById(id: number): Promise<MeasurementUnit>;
  create(entity: Partial<MeasurementUnit>): Promise<MeasurementUnit>;
  update(id: number, entity: Partial<MeasurementUnit>): Promise<MeasurementUnit>;
  delete(id: number): Promise<void>;
  count(criteria?: any): Promise<number>;
  calculateNextCode(businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }>;
  checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
  manager: any;
}

export const IMeasurementUnitRepository = Symbol('IMeasurementUnitRepository');

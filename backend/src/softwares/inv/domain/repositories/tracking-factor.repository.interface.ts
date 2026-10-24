import { TrackingFactor } from '../entities/tracking-factor.entity';

export interface ITrackingFactorRepository {
  manager: any;
  checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
  checkDuplicateCode(code: number, excludeId?: number): Promise<boolean>;
  checkDuplicatePriority(priority: number, excludeId?: number): Promise<boolean>;
  checkDuplicateName(name: string, excludeId?: number): Promise<boolean>;
  checkDuplicateName2(name2: string, excludeId?: number): Promise<boolean>;
  findAll(criteria?: any): Promise<TrackingFactor[]>;
  findById(id: number): Promise<TrackingFactor | null>;
  create(entity: Partial<TrackingFactor>): Promise<TrackingFactor>;
  update(id: number, entity: Partial<TrackingFactor>): Promise<TrackingFactor>;
  delete(id: number): Promise<void>;
  count(criteria?: any): Promise<number>;
  calculateNextCode(): Promise<number>;
  calculateNextPriority(): Promise<number>;
}

export const ITrackingFactorRepositoryToken = Symbol('ITrackingFactorRepository');

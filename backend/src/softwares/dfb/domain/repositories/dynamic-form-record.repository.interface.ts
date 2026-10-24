import { DynamicFormRecord } from '../entities/dynamic-form-record.entity';

export interface IDynamicFormRecordRepository {
  create(entity: Partial<DynamicFormRecord>): Promise<DynamicFormRecord>;
  save(entity: DynamicFormRecord): Promise<DynamicFormRecord>;
  findOne(id: number): Promise<DynamicFormRecord | null>;
  findAllByForm(formId: number, companyId: number): Promise<DynamicFormRecord[]>;
  remove(id: number): Promise<void>;
}

export const IDynamicFormRecordRepositoryToken = Symbol('IDynamicFormRecordRepository');

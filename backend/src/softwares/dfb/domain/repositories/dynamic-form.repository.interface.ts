import { DynamicForm } from '../entities/dynamic-form.entity';

export interface IDynamicFormRepository {
  create(entity: Partial<DynamicForm>): Promise<DynamicForm>;
  save(entity: DynamicForm): Promise<DynamicForm>;
  findOne(id: number): Promise<DynamicForm | null>;
  findByCode(code: string, companyId: number): Promise<DynamicForm | null>;
  findAll(): Promise<DynamicForm[]>;
  remove(id: number): Promise<void>;
}

export const IDynamicFormRepositoryToken = Symbol('IDynamicFormRepository');

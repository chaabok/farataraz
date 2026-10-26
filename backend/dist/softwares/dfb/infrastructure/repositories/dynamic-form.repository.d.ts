import { Repository } from 'typeorm';
import { DynamicForm } from '../../domain/entities/dynamic-form.entity';
import { IDynamicFormRepository } from '../../domain/repositories/dynamic-form.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class DynamicFormRepository implements IDynamicFormRepository {
    private readonly repo;
    private readonly requestContext;
    constructor(repo: Repository<DynamicForm>, requestContext: RequestContextService);
    create(entity: Partial<DynamicForm>): Promise<DynamicForm>;
    save(entity: DynamicForm): Promise<DynamicForm>;
    findOne(id: number): Promise<DynamicForm | null>;
    findByCode(code: string, companyId: number): Promise<DynamicForm | null>;
    findAll(): Promise<DynamicForm[]>;
    remove(id: number): Promise<void>;
}

import { Repository } from 'typeorm';
import { DynamicFormRecord } from '../../domain/entities/dynamic-form-record.entity';
import { IDynamicFormRecordRepository } from '../../domain/repositories/dynamic-form-record.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class DynamicFormRecordRepository implements IDynamicFormRecordRepository {
    private readonly repo;
    private readonly requestContext;
    constructor(repo: Repository<DynamicFormRecord>, requestContext: RequestContextService);
    create(entity: Partial<DynamicFormRecord>): Promise<DynamicFormRecord>;
    save(entity: DynamicFormRecord): Promise<DynamicFormRecord>;
    findOne(id: number): Promise<DynamicFormRecord | null>;
    findAllByForm(formId: number, companyId: number): Promise<DynamicFormRecord[]>;
    remove(id: number): Promise<void>;
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DynamicFormRecord } from '../../domain/entities/dynamic-form-record.entity';
import { IDynamicFormRecordRepository } from '../../domain/repositories/dynamic-form-record.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class DynamicFormRecordRepository implements IDynamicFormRecordRepository {
  constructor(
    @InjectRepository(DynamicFormRecord)
    private readonly repo: Repository<DynamicFormRecord>,
    private readonly requestContext: RequestContextService,
  ) {}

  async create(entity: Partial<DynamicFormRecord>): Promise<DynamicFormRecord> {
    return this.repo.create(entity);
  }

  async save(entity: DynamicFormRecord): Promise<DynamicFormRecord> {
    return this.repo.save(entity);
  }

  async findOne(id: number): Promise<DynamicFormRecord | null> {
    const bsId = this.requestContext.getBusinessStructureId();
    const query = this.repo.createQueryBuilder('r')
      .where('r.dynamicFormRecordId = :id', { id });

    if (bsId) {
      query.andWhere('r.businessStructureRef = :bsId', { bsId });
    }

    return query.getOne();
  }

  async findAllByForm(formId: number, companyId: number): Promise<DynamicFormRecord[]> {
    const bsId = this.requestContext.getBusinessStructureId();
    const query = this.repo.createQueryBuilder('r')
      .where('r.formRef = :formId', { formId });

    if (companyId) {
      query.andWhere('r.companyRef = :companyId', { companyId });
    }
    if (bsId) {
      query.andWhere('r.businessStructureRef = :bsId', { bsId });
    }

    query.orderBy('r.dynamicFormRecordId', 'DESC');
    return query.getMany();
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

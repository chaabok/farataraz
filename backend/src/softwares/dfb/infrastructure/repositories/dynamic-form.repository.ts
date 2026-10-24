import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DynamicForm } from '../../domain/entities/dynamic-form.entity';
import { IDynamicFormRepository } from '../../domain/repositories/dynamic-form.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class DynamicFormRepository implements IDynamicFormRepository {
  constructor(
    @InjectRepository(DynamicForm)
    private readonly repo: Repository<DynamicForm>,
    private readonly requestContext: RequestContextService,
  ) {}

  async create(entity: Partial<DynamicForm>): Promise<DynamicForm> {
    return this.repo.create(entity);
  }

  async save(entity: DynamicForm): Promise<DynamicForm> {
    return this.repo.save(entity);
  }

  async findOne(id: number): Promise<DynamicForm | null> {
    const bsId = this.requestContext.getBusinessStructureId();
    const query = this.repo.createQueryBuilder('f')
      .where('f.dynamicFormId = :id', { id });

    if (bsId) {
      query.andWhere('f.businessStructureRef = :bsId', { bsId });
    }

    return query.getOne();
  }

  async findByCode(code: string, companyId: number): Promise<DynamicForm | null> {
    const bsId = this.requestContext.getBusinessStructureId();
    const query = this.repo.createQueryBuilder('f')
      .where('f.formCode = :code', { code });

    if (companyId) {
      query.andWhere('f.companyRef = :companyId', { companyId });
    }
    if (bsId) {
      query.andWhere('f.businessStructureRef = :bsId', { bsId });
    }

    return query.getOne();
  }

  async findAll(): Promise<DynamicForm[]> {
    const bsId = this.requestContext.getBusinessStructureId();
    const query = this.repo.createQueryBuilder('f');

    if (bsId) {
      query.where('f.businessStructureRef = :bsId', { bsId });
    }

    query.orderBy('f.dynamicFormId', 'ASC');
    return query.getMany();
  }

  async remove(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}

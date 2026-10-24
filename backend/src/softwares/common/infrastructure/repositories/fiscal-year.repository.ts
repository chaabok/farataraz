import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FiscalYear } from '../../domain/entities/fiscal-year.entity';
import { IFiscalYearRepository } from '../../domain/repositories/fiscal-year.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { BusinessStructure } from '../../domain/entities/business-structure.entity';
import { BaseSettings } from '../../domain/entities/base-settings.entity';

@Injectable()
export class FiscalYearRepository implements IFiscalYearRepository {
  constructor(
    @InjectRepository(FiscalYear)
    private readonly repository: Repository<FiscalYear>,
    private readonly requestContextService: RequestContextService,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async create(data: Partial<FiscalYear>): Promise<FiscalYear> {
    const { bsId, compId } = await this.getScope();
    const fiscalYearID = data.fiscalYearID || await this.idGenerationService.generateNextId('FiscalYear');
    const entity = this.repository.create({
      ...data,
      fiscalYearID,
      businessStructureRef: data.businessStructureRef || bsId,
      companyRef: data.companyRef || compId,
    });
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<FiscalYear>): Promise<FiscalYear> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async findById(id: number): Promise<FiscalYear> {
    return this.repository.findOne({ where: { fiscalYearID: id } });
  }

  async findAll(): Promise<FiscalYear[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.repository.find({
      where,
      order: { fiscalYearID: 'DESC' }
    });
  }

  async findWithPagination(skip: number, take: number): Promise<[FiscalYear[], number]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.repository.findAndCount({
      where,
      skip,
      take,
      order: { fiscalYearID: 'DESC' }
    });
  }

  async findAdvanced(params: any): Promise<[FiscalYear[], number]> {
    const { bsId, compId, isShared } = await this.getScope();
    const { applyDataGridParams } = await import('../../../../core/utils/typeorm-query-builder');
    const queryBuilder = this.repository.createQueryBuilder('fiscalYear');

    if (isShared) {
      queryBuilder.where('fiscalYear.businessStructureRef = :bsId', { bsId });
    } else {
      queryBuilder.where('fiscalYear.companyRef = :compId', { compId });
    }

    applyDataGridParams(queryBuilder, params, 'fiscalYear');
    return queryBuilder.getManyAndCount();
  }

  async findByTitle(title: string): Promise<FiscalYear> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared 
      ? { title, businessStructureRef: bsId } 
      : { title, companyRef: compId };
    return this.repository.findOne({ where });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

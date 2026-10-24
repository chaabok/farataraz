import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Like } from 'typeorm';
import { ICashRepository } from '../../domain/repositories/cash.repository.interface';
import { Cash } from '../../domain/entities/cash.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { BaseSettings } from '../../../common/domain/entities/base-settings.entity';
import { BusinessStructure } from '../../../common/domain/entities/business-structure.entity';

@Injectable()
export class CashRepository implements ICashRepository {
  constructor(
    @InjectRepository(Cash)
    private readonly typeOrmRepo: Repository<Cash>,
    private readonly idGenService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
    @Inject(forwardRef(() => BaseSettingsService))
    private readonly baseSettingsService: BaseSettingsService,
  ) {}

  private async getScope() {
    const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    const compId = this.requestContextService.getCompanyId() ?? 2;
    let isShared = true;

    try {
      const rows = await this.typeOrmRepo.manager.connection.query(
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

  async create(data: Partial<Cash>): Promise<Cash> {
    if (!data.cashId) {
      data.cashId = await this.idGenService.generateNextId('Cash');
    }
    const { bsId, compId } = await this.getScope();
    const item = this.typeOrmRepo.create({
      ...data,
      businessStructureRef: bsId,
      companyRef: compId,
    });
    return this.typeOrmRepo.save(item);
  }

  async update(id: number, data: Partial<Cash>): Promise<Cash> {
    await this.typeOrmRepo.update(id, data);
    return this.findById(id) as Promise<Cash>;
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete(id);
  }

  async findById(id: number): Promise<Cash | null> {
    return this.typeOrmRepo.findOne({ 
      where: { cashId: id },
      relations: ['detailedAccount', 'currency', 'cashiers', 'cashiers.user']
    });
  }

  async findAll(): Promise<Cash[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.typeOrmRepo.find({
      where,
      relations: ['detailedAccount', 'currency', 'cashiers', 'cashiers.user'],
      order: { cashId: 'DESC' }
    });
  }

  async findAdvanced(params: {
    pageIndex: number;
    pageSize: number;
    sorting?: string;
    columnFilters?: string;
    globalFilter?: string;
    advancedFilters?: string;
  }): Promise<[Cash[], number]> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.typeOrmRepo.createQueryBuilder('cash')
      .leftJoinAndSelect('cash.detailedAccount', 'detailedAccount')
      .leftJoinAndSelect('cash.currency', 'currency')
      .leftJoinAndSelect('cash.cashiers', 'cashiers')
      .leftJoinAndSelect('cashiers.user', 'user');

    if (isShared) {
      qb.where('cash.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('cash.companyRef = :compId', { compId });
    }

    Object.assign(params, { globalSearchFields: ['cash.code', 'cash.title', 'cash.title_en'] });
    applyDataGridParams(qb, params, 'cash');

    return qb.getManyAndCount();
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { [field]: value };
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }
    if (excludeId) {
      where.cashId = Not(parseInt(excludeId as any, 10));
    }
    const count = await this.typeOrmRepo.count({ where });
    return count > 0;
  }
}
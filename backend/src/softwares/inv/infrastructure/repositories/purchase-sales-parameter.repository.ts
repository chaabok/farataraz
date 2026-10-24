import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { PurchaseSalesParameter } from '../../domain/entities/purchase-sales-parameter.entity';
import { IPurchaseSalesParameterRepository } from '../../domain/repositories/purchase-sales-parameter.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class PurchaseSalesParameterRepository implements IPurchaseSalesParameterRepository {
  constructor(
    @InjectRepository(PurchaseSalesParameter)
    private readonly repository: Repository<PurchaseSalesParameter>,
    private readonly requestContextService: RequestContextService
  ) {}

  get manager() {
    return this.repository.manager;
  }

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.connection.query(
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

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { [field]: value };

    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    if (excludeId) {
      where.PurchaseSalesParameterID = Not(parseInt(excludeId as any, 10));
    }
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async findAll(criteria?: any): Promise<PurchaseSalesParameter[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = criteria?.where ? { ...criteria.where } : {};
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.repository.find({ ...criteria, where, order: { PrintPriority: 'ASC', PurchaseSalesParameterID: 'ASC' } });
  }

  async findById(id: number): Promise<PurchaseSalesParameter | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { PurchaseSalesParameterID: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.repository.findOne({ where });
  }

  async create(entity: Partial<PurchaseSalesParameter>): Promise<PurchaseSalesParameter> {
    const { bsId, compId } = await this.getScope();
    if (!entity.businessStructureRef || entity.businessStructureRef <= 1) entity.businessStructureRef = bsId;
    if (!entity.companyRef || entity.companyRef <= 1) entity.companyRef = compId;
    const newEntity = this.repository.create(entity);
    return this.repository.save(newEntity);
  }

  async update(id: number, entity: Partial<PurchaseSalesParameter>): Promise<PurchaseSalesParameter> {
    const existing = await this.repository.findOne({ where: { PurchaseSalesParameterID: id } });
    if (!existing) {
      throw new Error('پارامتر خرید و فروش یافت نشد');
    }
    const merged = this.repository.merge(existing, entity);
    return this.repository.save(merged);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}

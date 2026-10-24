import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { SalesItemGroup } from '../../domain/entities/sales-item-group.entity';
import { ISalesItemGroupRepository } from '../../domain/repositories/sales-item-group.repository.interface';
import { EntityNumbering } from '../../../common/domain/entities/entity-numbering.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class SalesItemGroupRepository implements ISalesItemGroupRepository {
  constructor(
    @InjectRepository(SalesItemGroup)
    private readonly repository: Repository<SalesItemGroup>,
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
      where.SalesItemGroupID = Not(parseInt(excludeId as any, 10));
    }
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async findAll(criteria?: any): Promise<SalesItemGroup[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = criteria?.where ? { ...criteria.where } : {};
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.repository.find({ ...criteria, where });
  }

  async findById(id: number): Promise<SalesItemGroup> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { SalesItemGroupID: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.repository.findOne({ where });
  }

  async create(entity: Partial<SalesItemGroup>): Promise<SalesItemGroup> {
    const { bsId, compId } = await this.getScope();
    if (!entity.businessStructureRef || entity.businessStructureRef <= 1) entity.businessStructureRef = bsId;
    if (!entity.companyRef || entity.companyRef <= 1) entity.companyRef = compId;
    const newEntity = this.repository.create(entity);
    return this.repository.save(newEntity);
  }

  async update(id: number, entity: Partial<SalesItemGroup>): Promise<SalesItemGroup> {
    await this.repository.update(id, entity);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async count(criteria?: any): Promise<number> {
    return this.repository.count(criteria);
  }

  async calculateNextCode(businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }> {
    const manager = this.repository.manager;
    let config = await manager.getRepository(EntityNumbering).findOne({
      where: {
        entityRef: 'sales_item_group',
        companyRef: companyId,
      }
    });

    if (!config) {
      config = await manager.getRepository(EntityNumbering).findOne({
        where: {
          entityRef: 'sales_item_group',
          businessStructureRef: businessStructureId,
        }
      });
    }

    let numberingMethod = '2';
    let items: any = null;

    if (config) {
      numberingMethod = config.numberingMethod || '2';
      items = config.items;
    }

    let startNumber = 1;
    let endNumber = 999999;
    let fixedChar = '';

    if (items) {
      let fYears = items.fiscalYears || [];
      if (Array.isArray(items)) fYears = items;
      if (fYears.length > 0) {
        startNumber = parseInt(fYears[0].startNumber || '1', 10);
        endNumber = parseInt(fYears[0].endNumber || '999999', 10);
        fixedChar = fYears[0].fixedChar || '';
      }
    }

    const { isShared } = await this.getScope();
    let query = this.repository.createQueryBuilder('p');
    if (isShared) {
      query.where('p.businessStructureRef = :bsId', { bsId: businessStructureId });
    } else {
      query.where('p.companyRef = :compId', { compId: companyId });
    }

    const maxCodeRow = await query.select('MAX(p.SalesItemGroupCode)', 'maxCode').getRawOne();
    let nextNum = startNumber;
    if (maxCodeRow && maxCodeRow.maxCode) {
      const parsed = parseInt(maxCodeRow.maxCode, 10);
      if (!isNaN(parsed) && parsed >= startNumber) {
        nextNum = parsed + 1;
      }
    }

    if (nextNum > endNumber) {
      return { numberingMethod, nextValue: '', error: 'شماره‌گذاری از حد مجاز فراتر رفته است' };
    }

    const documentNumber = fixedChar ? `${fixedChar}${nextNum}` : `${nextNum}`;
    return { numberingMethod, nextValue: documentNumber };
  }
}

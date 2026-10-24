import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ItemAccountCategory } from '../../domain/entities/item-account-category.entity';
import { IItemAccountCategoryRepository } from '../../domain/repositories/item-account-category.repository.interface';
import { EntityNumbering } from '../../../common/domain/entities/entity-numbering.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class ItemAccountCategoryRepository implements IItemAccountCategoryRepository {
  constructor(
    @InjectRepository(ItemAccountCategory)
    private readonly repository: Repository<ItemAccountCategory>,
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
      where.ItemAccountCategoryID = Not(parseInt(excludeId as any, 10));
    }
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async findAll(criteria?: any): Promise<ItemAccountCategory[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = criteria?.where ? { ...criteria.where } : {};
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.repository.find({ ...criteria, where });
  }

  async findById(id: number): Promise<ItemAccountCategory> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { ItemAccountCategoryID: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.repository.findOne({ where });
  }

  async create(entity: Partial<ItemAccountCategory>): Promise<ItemAccountCategory> {
    const { bsId, compId } = await this.getScope();
    if (!entity.businessStructureRef || entity.businessStructureRef <= 1) entity.businessStructureRef = bsId;
    if (!entity.companyRef || entity.companyRef <= 1) entity.companyRef = compId;
    const newEntity = this.repository.create(entity);
    return this.repository.save(newEntity);
  }

  async update(id: number, entity: Partial<ItemAccountCategory>): Promise<ItemAccountCategory> {
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
        entityRef: 'item_account_category',
        companyRef: companyId,
      }
    });

    if (!config) {
      config = await manager.getRepository(EntityNumbering).findOne({
        where: {
          entityRef: 'item_account_category',
          businessStructureRef: businessStructureId,
        }
      });
    }

    let numberingMethod = '2'; // automatic
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
      if (Array.isArray(items)) {
        fYears = items;
      }
      if (fYears.length > 0) {
        startNumber = parseInt(fYears[0].startNumber || '1', 10);
        endNumber = parseInt(fYears[0].endNumber || '999999', 10);
        fixedChar = fYears[0].fixedChar || '';
      }
    }

    const { isShared } = await this.getScope();
    let query = this.repository.createQueryBuilder('p');
    if (isShared) {
      query.where('p.businessStructureRef = :businessStructureId', { businessStructureId });
    } else {
      query.where('p.companyRef = :companyId', { companyId });
    }

    const lastRecord = await query
      .orderBy('p.ItemAccountCategoryCode', 'DESC')
      .getOne();

    let nextSeq = startNumber;
    if (lastRecord && lastRecord.ItemAccountCategoryCode) {
      const lastValStr = String(lastRecord.ItemAccountCategoryCode);
      let prefixStr = String(fixedChar || '');
      if (prefixStr && lastValStr.startsWith(prefixStr)) {
        const numPart = lastValStr.slice(prefixStr.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      } else {
        const matchDigits = lastValStr.match(/\d+$/);
        if (matchDigits) {
          nextSeq = parseInt(matchDigits[0], 10) + 1;
        } else {
           nextSeq = lastRecord.ItemAccountCategoryCode + 1;
        }
      }
    }

    if (nextSeq > endNumber) {
      return {
        numberingMethod,
        nextValue: '',
        error: `شماره تولید شده (${nextSeq}) از شماره پایانی تعریف شده (${endNumber}) در روش شماره گذاری تجاوز کرده است.`
      };
    }

    const formatted = String(fixedChar || '') + String(nextSeq);
    return { numberingMethod, nextValue: formatted };
  }
}

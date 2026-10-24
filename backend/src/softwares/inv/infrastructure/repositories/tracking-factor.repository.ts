import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { TrackingFactor } from '../../domain/entities/tracking-factor.entity';
import { ITrackingFactorRepository } from '../../domain/repositories/tracking-factor.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class TrackingFactorRepository implements ITrackingFactorRepository {
  constructor(
    @InjectRepository(TrackingFactor)
    private readonly repository: Repository<TrackingFactor>,
    private readonly requestContextService: RequestContextService,
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
    if (value === undefined || value === null) return false;
    if (typeof value === 'string' && value.trim() === '') return false;

    const { bsId, compId, isShared } = await this.getScope();
    const where: any = {};

    if (typeof value === 'string') {
      where[field] = value.trim();
    } else {
      where[field] = value;
    }

    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    if (excludeId) {
      where.TrackingFactorID = Not(excludeId);
    }

    const count = await this.repository.count({ where });
    return count > 0;
  }

  async checkDuplicateCode(code: number, excludeId?: number): Promise<boolean> {
    return this.checkDuplicate('TrackingFactorCode', code, excludeId);
  }

  async checkDuplicatePriority(priority: number, excludeId?: number): Promise<boolean> {
    return this.checkDuplicate('DisplayPriority', priority, excludeId);
  }

  async checkDuplicateName(name: string, excludeId?: number): Promise<boolean> {
    return this.checkDuplicate('TrackingFactorName', name, excludeId);
  }

  async checkDuplicateName2(name2: string, excludeId?: number): Promise<boolean> {
    return this.checkDuplicate('TrackingFactorName2', name2, excludeId);
  }

  async findAll(criteria?: any): Promise<TrackingFactor[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = criteria?.where ? { ...criteria.where } : {};
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    return this.repository.find({
      ...criteria,
      where,
      relations: ['relatedItems', 'relatedItems.item', 'constantValues'],
      order: { DisplayPriority: 'ASC', TrackingFactorCode: 'ASC' },
    });
  }

  async findById(id: number): Promise<TrackingFactor | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { TrackingFactorID: id };
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    return this.repository.findOne({
      where,
      relations: ['relatedItems', 'relatedItems.item', 'constantValues'],
    });
  }

  async create(entity: Partial<TrackingFactor>): Promise<TrackingFactor> {
    const { bsId, compId } = await this.getScope();
    if (!entity.businessStructureRef || entity.businessStructureRef <= 1) {
      entity.businessStructureRef = bsId;
    }
    if (!entity.companyRef || entity.companyRef <= 1) {
      entity.companyRef = compId;
    }

    const { relatedItems, ...cleanEntity } = entity as any;
    const newEntity = this.repository.create(cleanEntity as Partial<TrackingFactor>);
    return this.repository.save(newEntity);
  }

  async update(id: number, entity: Partial<TrackingFactor>): Promise<TrackingFactor> {
    const { relatedItems, ...cleanEntity } = entity as any;
    await this.repository.update(id, cleanEntity);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async count(criteria?: any): Promise<number> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = criteria?.where ? { ...criteria.where } : {};
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }
    return this.repository.count({ where });
  }

  async calculateNextCode(): Promise<number> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('tf');

    if (isShared) {
      qb.where('tf.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('tf.companyRef = :compId', { compId });
    }

    const result = await qb
      .select('MAX(tf.TrackingFactorCode)', 'maxCode')
      .getRawOne();

    if (result && result.maxCode !== null && result.maxCode !== undefined) {
      const maxVal = Number(result.maxCode);
      if (!isNaN(maxVal) && maxVal > 0) {
        return maxVal + 1;
      }
    }
    return 1;
  }

  async calculateNextPriority(): Promise<number> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('tf');

    if (isShared) {
      qb.where('tf.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('tf.companyRef = :compId', { compId });
    }

    const result = await qb
      .select('MAX(tf.DisplayPriority)', 'maxPriority')
      .getRawOne();

    if (result && result.maxPriority !== null && result.maxPriority !== undefined) {
      const maxVal = Number(result.maxPriority);
      if (!isNaN(maxVal) && maxVal > 0) {
        return maxVal + 1;
      }
    }
    return 1;
  }
}

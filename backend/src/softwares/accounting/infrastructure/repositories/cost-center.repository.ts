import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CostCenter } from '../../domain/entities/cost-center.entity';
import { ICostCenterRepository } from '../../domain/repositories/cost-center.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';

@Injectable()
export class CostCenterRepository implements ICostCenterRepository {
  constructor(
    @InjectRepository(CostCenter)
    private readonly typeOrmRepo: Repository<CostCenter>,
    private readonly idGenService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.typeOrmRepo.manager.query(
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

  async create(data: Partial<CostCenter>): Promise<CostCenter> {
    const { bsId, compId } = await this.getScope();
    const id = await this.idGenService.generateNextId('CostCenter');
    const newEntity = this.typeOrmRepo.create({
      ...data,
      costCenterId: id,
      businessStructureRef: (data.businessStructureRef && data.businessStructureRef > 1) ? data.businessStructureRef : bsId,
      companyRef: (data.companyRef && data.companyRef > 1) ? data.companyRef : compId,
    });
    return this.typeOrmRepo.save(newEntity);
  }

  async update(id: number, data: Partial<CostCenter>): Promise<CostCenter> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('CostCenter not found');
    const updated = this.typeOrmRepo.merge(existing, data);
    return this.typeOrmRepo.save(updated);
  }

  async findAll(): Promise<CostCenter[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.typeOrmRepo.find({
      where,
      relations: ['detailedAccount'],
      order: { costCenterId: 'DESC' }
    });
  }

  async findById(id: number): Promise<CostCenter | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { costCenterId: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.typeOrmRepo.findOne({
      where,
      relations: ['detailedAccount']
    });
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete({ costCenterId: id });
  }

  async findAdvanced(params: any): Promise<[CostCenter[], number]> {
    const { bsId, compId, isShared } = await this.getScope();
    let qb = this.typeOrmRepo.createQueryBuilder('c')
      .leftJoinAndSelect('c.detailedAccount', 'da');

    if (isShared) {
      qb.where('c.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('c.companyRef = :compId', { compId });
    }

    qb = applyDataGridParams(qb, params, 'c');
    
    return qb.getManyAndCount();
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.typeOrmRepo.createQueryBuilder('e')
      .where(`e.${field} = :value`, { value });

    if (isShared) {
      qb.andWhere('e.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('e.companyRef = :compId', { compId });
    }

    if (excludeId) {
      qb.andWhere('e.costCenterId != :excludeId', { excludeId: parseInt(excludeId as any, 10) });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async getMaxCode(businessStructureRef: number): Promise<number> {
    const { bsId, compId, isShared } = await this.getScope();
    const whereCol = isShared ? 'c.businessStructureRef' : 'c.companyRef';
    const whereVal = isShared ? bsId : compId;
    const result = await this.typeOrmRepo.createQueryBuilder('c')
      .select('MAX(CAST(c.Code AS INT))', 'maxCode')
      .where(`${whereCol} = :val`, { val: whereVal })
      .getRawOne();
      
    if (result && result.maxCode) {
       return parseInt(result.maxCode, 10);
    }
    return 0;
  }
}


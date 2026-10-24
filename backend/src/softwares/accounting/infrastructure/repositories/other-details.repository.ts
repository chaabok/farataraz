import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtherDetails } from '../../domain/entities/other-details.entity';
import { IOtherDetailsRepository } from '../../domain/repositories/other-details.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class OtherDetailsRepository implements IOtherDetailsRepository {
  constructor(
    @InjectRepository(OtherDetails)
    private readonly typeOrmRepo: Repository<OtherDetails>,
    private readonly idGenerationService: IdGenerationService,
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

  async create(data: Partial<OtherDetails>): Promise<OtherDetails> {
    const { bsId, compId } = await this.getScope();
    const manualId = data.otherDetailsId;
    const nextId = manualId || await this.idGenerationService.generateNextId('OtherDetails');
    const newEntity = this.typeOrmRepo.create({
      ...data,
      otherDetailsId: nextId,
      businessStructureRef: (data.businessStructureRef && data.businessStructureRef > 1) ? data.businessStructureRef : bsId,
      companyRef: (data.companyRef && data.companyRef > 1) ? data.companyRef : compId,
    });
    try {
      return await this.typeOrmRepo.save(newEntity);
    } catch (error: any) {
      if (error.code === '23505' || error.number === 2627) {
        throw new ConflictException('عنوان وارد شده قبلا ثبت شده است');
      }
      throw error;
    }
  }

  async update(id: number, data: Partial<OtherDetails>): Promise<OtherDetails> {
    try {
      const existingEntity = await this.findById(id);
      if (!existingEntity) throw new Error('OtherDetails not found');
      
      const updatedEntity = this.typeOrmRepo.merge(existingEntity, data);
      return await this.typeOrmRepo.save(updatedEntity);
    } catch (error: any) {
      if (error.code === '23505' || error.number === 2627) {
        throw new ConflictException('عنوان وارد شده قبلا ثبت شده است');
      }
      throw error;
    }
  }

  async findAll(): Promise<OtherDetails[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.typeOrmRepo.find({ where });
  }
  
  async findWithPagination(skip: number, take: number): Promise<[OtherDetails[], number]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.typeOrmRepo.findAndCount({
      where,
      skip,
      take,
      order: { otherDetailsId: 'ASC' }
    });
  }

  async findAdvanced(params: any): Promise<[OtherDetails[], number]> {
    const { applyDataGridParams } = await import('../../../../core/utils/typeorm-query-builder');
    const { bsId, compId, isShared } = await this.getScope();
    const queryBuilder = this.typeOrmRepo.createQueryBuilder('od');
    if (isShared) {
      queryBuilder.where('od.businessStructureRef = :bsId', { bsId });
    } else {
      queryBuilder.where('od.companyRef = :compId', { compId });
    }
    applyDataGridParams(queryBuilder, params, 'od');
    if (!params.sorting || params.sorting === '[]') {
        queryBuilder.orderBy('LENGTH(od.title)', 'ASC').addOrderBy('od.title', 'ASC');
    }
    return queryBuilder.getManyAndCount();
  }

  async findById(id: number): Promise<OtherDetails | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { otherDetailsId: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.typeOrmRepo.findOne({ where });
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete({ otherDetailsId: id } as any);
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    if (!['title', 'title_en'].includes(field)) {
      throw new Error(`Invalid field for duplicate check: ${field}`);
    }
    const { bsId, compId, isShared } = await this.getScope();
    const query = this.typeOrmRepo.createQueryBuilder('od');
    
    if (typeof value === 'string' && (field === 'title' || field === 'title_en')) {
      const normalizedValue = value.replace(/[\s\u200c]+/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
      query.where(`REPLACE(REPLACE(REPLACE(REPLACE(CAST(od.${field} AS text), ' ', ''), CHR(8204), ''), 'ي', 'ی'), 'ك', 'ک') = :value`, { value: normalizedValue });
    } else {
      query.where(`od.${field} = :value`, { value });
    }
      
    if (isShared) {
      query.andWhere('od.businessStructureRef = :bsId', { bsId });
    } else {
      query.andWhere('od.companyRef = :compId', { compId });
    }
      
    if (excludeId) {
      query.andWhere('od.otherDetailsId != :excludeId', { excludeId: excludeId });
    }
    
    const count = await query.getCount();
    return count > 0;
  }
}

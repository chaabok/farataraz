import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { DetailedType } from '../../domain/entities/detailed-type.entity';
import { IDetailedTypeRepository } from '../../domain/repositories/detailed-type.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class DetailedTypeRepository implements IDetailedTypeRepository {
  constructor(
    @InjectRepository(DetailedType)
    private readonly typeOrmRepo: Repository<DetailedType>,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope(overrideBsId?: number) {
    let bsId = overrideBsId ?? this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = overrideBsId ?? this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;
    let hqId = bsId;

    try {
      const rows = await this.typeOrmRepo.manager.query(
        `SELECT "BusinessStructureID", "IsBasicInfoShared", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((bs: any) => {
          const isSharedVal = bs.IsBasicInfoShared !== undefined ? bs.IsBasicInfoShared : bs.is_basic_info_shared;
          return isSharedVal === false || isSharedVal === 0 || isSharedVal === 'false' || isSharedVal === null;
        })) {
          isShared = false;
        }

        const currRow = rows.find((r: any) => (r.BusinessStructureID || r.business_structure_id) === bsId) || rows[0];
        const parentRefVal = currRow.ParentRef !== undefined ? currRow.ParentRef : currRow.parent_ref;
        const parentRef = parentRefVal !== undefined && parentRefVal !== null ? parseInt(parentRefVal.toString(), 10) : 0;
        
        const bsTypeVal = currRow.BusinessStructure !== undefined ? currRow.BusinessStructure : currRow.business_structure;
        const bsEnum = bsTypeVal !== undefined && bsTypeVal !== null ? parseInt(bsTypeVal.toString(), 10) : 0;
        
        if (bsEnum !== 1 && parentRef > 0) {
          hqId = parentRef;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      console.error('DetailedTypeRepository.getScope raw query error:', err);
      isShared = false;
    }

    return { bsId, compId, hqId, isShared };
  }

  async create(data: Partial<DetailedType>): Promise<DetailedType> {
    const manualId = data.detailedTypesId;
    const nextId = manualId || await this.idGenerationService.generateNextId('DetailedType');
    
    const useOverride = data.businessStructureRef ? parseInt(data.businessStructureRef as any, 10) : undefined;
    
    const { bsId, compId, hqId } = await this.getScope(useOverride);
    
    const newEntity = this.typeOrmRepo.create({ 
      ...data, 
      detailedTypesId: nextId,
      businessStructureRef: hqId,
      companyRef: compId
    });
    try {
      return await this.typeOrmRepo.save(newEntity);
    } catch (error: any) {
      if (error.code === '23505' || error.number === 2627) {
        throw new ConflictException('کد یا عنوان وارد شده قبلا ثبت شده است');
      }
      throw error;
    }
  }

  async update(id: number, data: Partial<DetailedType>): Promise<DetailedType> {
    try {
      const existingEntity = await this.findById(id);
      if (!existingEntity) throw new Error('DetailedType not found');
      
      const updatedEntity = this.typeOrmRepo.merge(existingEntity, data);
      return await this.typeOrmRepo.save(updatedEntity);
    } catch (error: any) {
      if (error.code === '23505' || error.number === 2627) {
        throw new ConflictException('کد یا عنوان وارد شده قبلا ثبت شده است');
      }
      throw error;
    }
  }

  async findAll(): Promise<DetailedType[]> {
    const { bsId, compId, hqId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: hqId } : { companyRef: compId };
    return this.typeOrmRepo.find({
      where,
      order: { detailedTypesId: 'ASC' }
    });
  }
  
  async findWithPagination(skip: number, take: number): Promise<[DetailedType[], number]> {
    const { compId, hqId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: hqId } : { companyRef: compId };
    return this.typeOrmRepo.findAndCount({
      where,
      skip,
      take,
      order: { detailedTypesId: 'ASC' }
    });
  }

  async findAdvanced(params: any): Promise<[DetailedType[], number]> {
    const { applyDataGridParams } = await import('../../../../core/utils/typeorm-query-builder');
    const { bsId, compId, hqId, isShared } = await this.getScope();
    const queryBuilder = this.typeOrmRepo.createQueryBuilder('dt');
    
    if (isShared) {
      queryBuilder.where('dt.businessStructureRef = :hqId', { hqId });
    } else {
      queryBuilder.where('dt.companyRef = :compId', { compId });
    }
    
    applyDataGridParams(queryBuilder, params, 'dt');
    if (!params.sorting || params.sorting === '[]') {
        queryBuilder.orderBy('LENGTH(dt.code)', 'ASC').addOrderBy('dt.code', 'ASC');
    }
    return queryBuilder.getManyAndCount();
  }

  async findById(id: number): Promise<DetailedType | null> {
    return this.typeOrmRepo.findOne({ where: { detailedTypesId: id } });
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete(id);
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    if (!['code', 'title', 'title_en'].includes(field)) {
      throw new Error(`Invalid field for duplicate check: ${field}`);
    }
    const { bsId, compId, hqId, isShared } = await this.getScope();
    const query = this.typeOrmRepo.createQueryBuilder('dt');
    
    if (typeof value === 'string' && (field === 'title' || field === 'title_en')) {
      const normalizedValue = value.replace(/[\s\u200c]+/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
      query.where(`REPLACE(REPLACE(REPLACE(REPLACE(CAST(dt.${field} AS text), ' ', ''), CHR(8204), ''), 'ي', 'ی'), 'ك', 'ک') = :value`, { value: normalizedValue });
    } else {
      query.where(`dt.${field} = :value`, { value });
    }
    
    if (isShared) {
      query.andWhere('dt.businessStructureRef = :hqId', { hqId });
    } else {
      query.andWhere('dt.companyRef = :compId', { compId });
    }
      
    if (excludeId) {
      query.andWhere('dt.detailedTypesId != :excludeId', { excludeId: parseInt(excludeId as any, 10) });
    }
    
    const count = await query.getCount();
    return count > 0;
  }
}

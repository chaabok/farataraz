import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VoucherType } from '../../domain/entities/voucher-type.entity';
import { IVoucherTypeRepository } from '../../domain/repositories/voucher-type.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class VoucherTypeRepository implements IVoucherTypeRepository {
  constructor(
    @InjectRepository(VoucherType)
    private readonly typeOrmRepo: Repository<VoucherType>,
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
      console.error('VoucherTypeRepository.getScope raw query error:', err);
      isShared = false;
    }

    return { bsId, compId, hqId, isShared };
  }

  async create(data: Partial<VoucherType>): Promise<VoucherType> {
    const manualId = data.voucherTypeId;
    const nextId = manualId || await this.idGenerationService.generateNextId('VoucherType');
    
    const useOverride = data.businessStructureRef ? parseInt(data.businessStructureRef as any, 10) : undefined;
    
    const { bsId, compId, hqId } = await this.getScope(useOverride);
    
    const newEntity = this.typeOrmRepo.create({ 
      ...data, 
      voucherTypeId: nextId,
      businessStructureRef: hqId,
      companyRef: compId
    });
    try {
      return await this.typeOrmRepo.save(newEntity);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('کد وارد شده قبلا ثبت شده است');
      }
      throw error;
    }
  }

  async update(id: number, data: Partial<VoucherType>): Promise<VoucherType> {
    try {
      const existingEntity = await this.findById(id);
      if (!existingEntity) throw new Error('VoucherType not found');
      
      const updatedEntity = this.typeOrmRepo.merge(existingEntity, data);
      return await this.typeOrmRepo.save(updatedEntity);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('کد وارد شده قبلا ثبت شده است');
      }
      throw error;
    }
  }

  async findAll(): Promise<VoucherType[]> {
    const { bsId, compId, hqId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: hqId } : { companyRef: compId };
    return this.typeOrmRepo.find({
      where,
      order: { voucherTypeId: 'DESC' }
    });
  }
  
  async findWithPagination(skip: number, take: number): Promise<[VoucherType[], number]> {
    const { compId, hqId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: hqId } : { companyRef: compId };
    return this.typeOrmRepo.findAndCount({
      where,
      skip,
      take,
      order: { voucherTypeId: 'DESC' }
    });
  }

  async findAdvanced(params: any): Promise<[VoucherType[], number]> {
    const { applyDataGridParams } = await import('../../../../core/utils/typeorm-query-builder');
    const { bsId, compId, hqId, isShared } = await this.getScope();
    const queryBuilder = this.typeOrmRepo.createQueryBuilder('vt');
    
    if (isShared) {
      queryBuilder.where('vt.businessStructureRef = :hqId', { hqId });
    } else {
      queryBuilder.where('vt.companyRef = :compId', { compId });
    }
    
    applyDataGridParams(queryBuilder, params, 'vt');
    return queryBuilder.getManyAndCount();
  }

  async findById(id: number): Promise<VoucherType | null> {
    return this.typeOrmRepo.findOne({ where: { voucherTypeId: id } });
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete(id);
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    if (!['code', 'title', 'title_en'].includes(field)) {
      throw new Error(`Invalid field for duplicate check: ${field}`);
    }
    const { bsId, compId, hqId, isShared } = await this.getScope();
    const query = this.typeOrmRepo.createQueryBuilder('vt');
    
    if (typeof value === 'string' && (field === 'title' || field === 'title_en')) {
      const normalizedValue = value.replace(/[\s\u200c]+/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
      query.where(`REPLACE(REPLACE(REPLACE(REPLACE(CAST(vt.${field} AS text), ' ', ''), CHR(8204), ''), 'ي', 'ی'), 'ك', 'ک') = :value`, { value: normalizedValue });
    } else {
      query.where(`vt.${field} = :value`, { value });
    }
    
    if (isShared) {
      query.andWhere('vt.businessStructureRef = :hqId', { hqId });
    } else {
      query.andWhere('vt.companyRef = :compId', { compId });
    }
      
    if (excludeId) {
      query.andWhere('vt.voucherTypeId != :excludeId', { excludeId: parseInt(excludeId as any, 10) });
    }
    
    const count = await query.getCount();
    return count > 0;
  }
}

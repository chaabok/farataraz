import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Bank } from '../../domain/entities/bank.entity';
import { IBankRepository } from '../../domain/repositories/bank.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';
import { GeoLocation } from '../../../common/domain/entities/geo-location.entity';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { BaseSettings } from '../../../common/domain/entities/base-settings.entity';
import { BusinessStructure } from '../../../common/domain/entities/business-structure.entity';

@Injectable()
export class BankRepository implements IBankRepository {
  constructor(
    @InjectRepository(Bank)
    private readonly typeOrmRepo: Repository<Bank>,
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

  async create(data: Partial<Bank>): Promise<Bank> {
    if (!data.bankId) {
      data.bankId = await this.idGenService.generateNextId('Bank');
    }
    const { bsId, compId } = await this.getScope();
    
    const entity = this.typeOrmRepo.create({ 
      ...data, 
      businessStructureRef: bsId,
      companyRef: compId
    });
    return this.typeOrmRepo.save(entity);
  }

  async update(id: number, data: Partial<Bank>): Promise<void> {
    await this.typeOrmRepo.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete(id);
  }

  async findById(id: number): Promise<Bank | null> {
    return this.typeOrmRepo.findOne({ where: { bankId: id } });
  }

  async findAll(): Promise<Bank[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    
    return this.typeOrmRepo.find({
      where,
      order: { bankId: 'DESC' }
    });
  }

  async findAdvanced(params: any): Promise<[Bank[], number]> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.typeOrmRepo.createQueryBuilder('bank')
      .leftJoinAndMapOne('bank.nationalityLocation', GeoLocation, 'geoLocation', 'bank.NationalityRef = geoLocation.GeolocationID');

    if (isShared) {
      qb.where('bank.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('bank.companyRef = :compId', { compId });
    }

    Object.assign(params, { globalSearchFields: ['bank.code', 'bank.title', 'bank.latinTitle'] });
    applyDataGridParams(qb, params, 'bank');

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
      where.bankId = Not(parseInt(excludeId as any, 10));
    }
    const count = await this.typeOrmRepo.count({ where });
    return count > 0;
  }
}

import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { BankBranch } from '../../domain/entities/bank-branch.entity';
import { IBankBranchRepository } from '../../domain/repositories/bank-branch.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';
import { GeoLocation } from '../../../common/domain/entities/geo-location.entity';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { BaseSettings } from '../../../common/domain/entities/base-settings.entity';
import { BusinessStructure } from '../../../common/domain/entities/business-structure.entity';

@Injectable()
export class BankBranchRepository implements IBankBranchRepository {
  constructor(
    @InjectRepository(BankBranch)
    private readonly typeOrmRepo: Repository<BankBranch>,
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

  async create(data: Partial<BankBranch>): Promise<BankBranch> {
    if (!data.bankBranchId) {
      data.bankBranchId = await this.idGenService.generateNextId('BankBranch');
    }
    const { bsId, compId } = await this.getScope();
    const entity = this.typeOrmRepo.create({ 
      ...data, 
      businessStructureRef: bsId,
      companyRef: compId
    });
    return this.typeOrmRepo.save(entity);
  }

  async update(id: number, data: Partial<BankBranch>): Promise<void> {
    await this.typeOrmRepo.update(id, data);
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete(id);
  }

  async findById(id: number): Promise<BankBranch | null> {
    return this.typeOrmRepo.findOne({ 
      where: { bankBranchId: id },
      relations: ['bank', 'city'] 
    });
  }

  async findAll(): Promise<BankBranch[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.typeOrmRepo.find({
      where,
      relations: ['bank', 'city'],
      order: { bankBranchId: 'DESC' }
    });
  }

  async findAdvanced(params: any): Promise<[BankBranch[], number]> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.typeOrmRepo.createQueryBuilder('branch')
      .leftJoinAndSelect('branch.bank', 'bank')
      .leftJoinAndSelect('branch.city', 'city')
      .leftJoinAndMapOne('city.parent', GeoLocation, 'province', 'city.ParentRef = province.GeolocationID AND city.ParentRef > 0')
      .leftJoinAndMapOne('province.parent', GeoLocation, 'country', 'province.ParentRef = country.GeolocationID AND province.ParentRef > 0');

    if (isShared) {
      qb.where('branch.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('branch.companyRef = :compId', { compId });
    }

    Object.assign(params, { globalSearchFields: ['branch.branchCode', 'branch.title', 'branch.latinTitle', 'bank.title'] });
    applyDataGridParams(qb, params, 'branch');

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
      where.bankBranchId = Not(parseInt(excludeId as any, 10));
    }
    const count = await this.typeOrmRepo.count({ where });
    return count > 0;
  }
}

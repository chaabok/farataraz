import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccountType } from '../../domain/entities/bank-account-type.entity';
import { IBankAccountTypeRepository } from '../../domain/repositories/bank-account-type.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class BankAccountTypeRepository implements IBankAccountTypeRepository {
  constructor(
    @InjectRepository(BankAccountType)
    private readonly repository: Repository<BankAccountType>,
    private readonly requestContextService: RequestContextService,
    private readonly idGenService: IdGenerationService,
  ) {}

  private async getScope() {
    const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    const compId = this.requestContextService.getCompanyId() ?? 2;
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

  async findAll(): Promise<BankAccountType[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return await this.repository.find({
      where,
      order: { code: 'ASC' }
    });
  }

  async findById(id: number): Promise<BankAccountType | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { bankAccountTypeId: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return await this.repository.findOne({ where });
  }

  async create(entity: BankAccountType): Promise<BankAccountType> {
    const { bsId, compId } = await this.getScope();
    if (!entity.businessStructureRef || entity.businessStructureRef <= 1) entity.businessStructureRef = bsId;
    if (!entity.companyRef || entity.companyRef <= 1) entity.companyRef = compId;
    if (!entity.bankAccountTypeId || entity.bankAccountTypeId <= 0) {
      entity.bankAccountTypeId = await this.idGenService.generateNextId('BankAccountTypes');
    }
    const newEntity = this.repository.create(entity);
    return await this.repository.save(newEntity);
  }

  async update(id: number, entity: Partial<BankAccountType>): Promise<BankAccountType> {
    await this.repository.update({ bankAccountTypeId: id }, entity);
    return await this.findById(id) as BankAccountType;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ bankAccountTypeId: id });
  }

  async count(): Promise<number> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return await this.repository.count({ where });
  }

  async getMaxId(): Promise<number> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository
      .createQueryBuilder('bat')
      .select('MAX(bat.bankAccountTypeId)', 'max');
    if (isShared) {
      qb.where('bat.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('bat.companyRef = :compId', { compId });
    }
    const result = await qb.getRawOne();
    return result?.max ? parseInt(result.max, 10) : 0;
  }

  async findAdvanced(params: any): Promise<[BankAccountType[], number]> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('bat');
    if (isShared) {
      qb.where('bat.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('bat.companyRef = :compId', { compId });
    }
    Object.assign(params, { globalSearchFields: ['bat.code', 'bat.title', 'bat.latinTitle'] });
    const { applyDataGridParams } = require('../../../../core/utils/typeorm-query-builder');
    applyDataGridParams(qb, params, 'bat');
    return qb.getManyAndCount();
  }
}

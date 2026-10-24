import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankAccount } from '../../domain/entities/bank-account.entity';
import { IBankAccountRepository } from '../../domain/repositories/bank-account.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { BaseSettings } from '../../../common/domain/entities/base-settings.entity';
import { BusinessStructure } from '../../../common/domain/entities/business-structure.entity';

@Injectable()
export class BankAccountRepository implements IBankAccountRepository {
  constructor(
    @InjectRepository(BankAccount)
    private readonly repository: Repository<BankAccount>,
    private readonly requestContextService: RequestContextService,
    private readonly idGenService: IdGenerationService,
    @Inject(forwardRef(() => BaseSettingsService))
    private readonly baseSettingsService: BaseSettingsService,
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

  private async getBuilder() {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('bankAccount')
      .leftJoinAndSelect('bankAccount.bankBranch', 'bankBranch')
      .leftJoinAndSelect('bankBranch.bank', 'bank')
      .leftJoinAndSelect('bankAccount.bankAccountType', 'bankAccountType')
      .leftJoinAndSelect('bankAccount.account', 'account')
      .leftJoinAndSelect('bankAccount.currency', 'currency');

    if (isShared) {
      qb.where('bankAccount.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('bankAccount.companyRef = :compId', { compId });
    }
    return qb;
  }

  async create(bankAccount: BankAccount): Promise<BankAccount> {
    if (!bankAccount.bankAccountId) {
      bankAccount.bankAccountId = await this.idGenService.generateNextId('BankAccounts');
    }
    
    const { bsId, compId } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;
    bankAccount.businessStructureRef = bsId;
    bankAccount.companyRef = compId;
    bankAccount.creator = userId;
    bankAccount.lastModifier = userId;
    return this.repository.save(bankAccount);
  }

  async update(bankAccountId: number, bankAccount: Partial<BankAccount>): Promise<BankAccount> {
    const { bsId, compId, isShared } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;
    bankAccount.lastModifier = userId;
    
    // We cannot use TypeORM update with AppBaseEntity fields if they're not explicitly defined, so we just use what we have or save.
    // .update does not automatically set updatedAt for @UpdateDateColumn in some versions if passed explicitly or using update()
    const whereCondition: any = { bankAccountId };
    if (isShared) {
      whereCondition.businessStructureRef = bsId;
    } else {
      whereCondition.companyRef = compId;
    }
    
    await this.repository.update(whereCondition, bankAccount);
    return this.findById(bankAccountId) as Promise<BankAccount>;
  }

  async delete(bankAccountId: number): Promise<void> {
    const { bsId, compId, isShared } = await this.getScope();
    const whereCondition: any = { bankAccountId };
    if (isShared) {
      whereCondition.businessStructureRef = bsId;
    } else {
      whereCondition.companyRef = compId;
    }
    await this.repository.delete(whereCondition);
  }

  async findById(bankAccountId: number): Promise<BankAccount | null> {
    const qb = await this.getBuilder();
    return qb.andWhere('bankAccount.bankAccountId = :bankAccountId', { bankAccountId }).getOne();
  }

  async findAll(options?: any): Promise<{items: BankAccount[], total: number}> {
    const qb = await this.getBuilder();
    if (options) {
      applyDataGridParams(qb, options, 'bankAccount');
      if (options.excludeId) {
        qb.andWhere('bankAccount.bankAccountId != :excludeId', { excludeId: options.excludeId });
      }
      if (options.isActive !== undefined) {
        qb.andWhere('bankAccount.isActive = :isActive', { isActive: options.isActive === 'true' || options.isActive === true });
      }
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecieptAndPaymentAccountingSetting } from '../../domain/entities/reciept-and-payment-accounting-setting.entity';
import { IRecieptAndPaymentAccountingSettingRepository } from '../../domain/repositories/reciept-and-payment-accounting-setting.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';
import { EntityNumbering } from '../../../common/domain/entities/entity-numbering.entity';

@Injectable()
export class RecieptAndPaymentAccountingSettingRepository implements IRecieptAndPaymentAccountingSettingRepository {
  constructor(
    @InjectRepository(RecieptAndPaymentAccountingSetting)
    private readonly repository: Repository<RecieptAndPaymentAccountingSetting>,
    private readonly requestContextService: RequestContextService,
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
    } catch(e) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async create(entity: RecieptAndPaymentAccountingSetting): Promise<RecieptAndPaymentAccountingSetting> {
    const newEntity = this.repository.create(entity);
    return await this.repository.save(newEntity);
  }

  async update(entity: RecieptAndPaymentAccountingSetting): Promise<RecieptAndPaymentAccountingSetting> {
    return await this.repository.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ recieptAndPaymentAccountingSettingId: id } as any);
  }

  async findById(id: number): Promise<RecieptAndPaymentAccountingSetting | null> {
    return await this.repository.findOne({ 
      where: { recieptAndPaymentAccountingSettingId: id } as any,
      relations: ['account']
    });
  }

  async findAll(options?: any): Promise<{items: RecieptAndPaymentAccountingSetting[], total: number}> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('rapSetting')
      .leftJoinAndSelect('rapSetting.account', 'account');

    if (isShared) {
      qb.where('rapSetting.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('rapSetting.companyRef = :compId', { compId });
    }

    if (options?.usedEntryType) {
      qb.andWhere('rapSetting.usedEntryType = :usedEntryType', { usedEntryType: options.usedEntryType });
    }
    if (options?.operationType) {
      qb.andWhere('rapSetting.operationType = :operationType', { operationType: options.operationType });
    }
    if (options?.isActive === 'true' || options?.isActive === true) {
      qb.andWhere('rapSetting.isActive = :isActive', { isActive: true });
    } else if (options?.isActive === 'false' || options?.isActive === false) {
      qb.andWhere('rapSetting.isActive = :isActive', { isActive: false });
    }
    if (options?.hasAccount === 'true' || options?.hasAccount === true) {
      qb.andWhere('rapSetting.accountRef IS NOT NULL');
    }

    if (options) {
      applyDataGridParams(qb, options, 'rapSetting');
    } else {
      qb.orderBy('rapSetting.creationDate', 'DESC');
    }

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findByCode(code: string): Promise<RecieptAndPaymentAccountingSetting | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { code };
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    return await this.repository.findOne({ where });
  }

  async calculateNextCode(businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }> {
    const manager = this.repository.manager;
    
    let config = await manager.getRepository(EntityNumbering).findOne({
      where: {
        entityRef: 'rap_accounting_setting',
        companyRef: companyId,
      }
    });

    if (!config) {
      config = await manager.getRepository(EntityNumbering).findOne({
        where: {
          entityRef: 'rap_accounting_setting',
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

    let query = this.repository.createQueryBuilder('p')
      .where('p.companyRef = :companyId', { companyId })
      .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });

    const lastRecord = await query
      .orderBy('CAST(p.code AS int)', 'DESC')
      .getOne();

    let nextSeq = startNumber;
    if (lastRecord && lastRecord.code) {
      const lastValStr = String(lastRecord.code);
      let prefixStr = String(fixedChar || '');
      if (prefixStr && lastValStr.startsWith(prefixStr)) {
        const numPart = lastValStr.slice(prefixStr.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      } else {
        const matchDigits = lastValStr.match(/\\d+$/);
        if (matchDigits) {
          nextSeq = parseInt(matchDigits[0], 10) + 1;
        } else {
           nextSeq = (parseInt(lastRecord.code, 10) || 0) + 1;
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

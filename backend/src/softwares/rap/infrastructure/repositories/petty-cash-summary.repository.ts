import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PettyCashSummary } from '../../domain/entities/petty-cash-summary.entity';
import { EntityNumbering } from '../../../common/domain/entities/entity-numbering.entity';
import { IPettyCashSummaryRepository } from '../../domain/repositories/petty-cash-summary.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';
import momentJalaali from 'moment-jalaali';

@Injectable()
export class PettyCashSummaryRepository implements IPettyCashSummaryRepository {
  constructor(
    @InjectRepository(PettyCashSummary)
    private readonly repository: Repository<PettyCashSummary>,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope() {
    const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    const compId = this.requestContextService.getCompanyId() ?? 2;
    const fiscalYearId = this.requestContextService.getFiscalYearId() ?? 1;
    return { bsId, compId, fiscalYearId };
  }

  private async getBuilder(): Promise<SelectQueryBuilder<PettyCashSummary>> {
    const { bsId, compId, fiscalYearId } = await this.getScope();
    const qb = this.repository.createQueryBuilder('summary')
      .leftJoinAndSelect('summary.pettyCash', 'pettyCash')
      .leftJoinAndSelect('pettyCash.party', 'pettyCashParty')
      .leftJoinAndSelect('pettyCashParty.detailedAccount', 'detailedAccount')
      .leftJoinAndSelect('summary.items', 'items')
      .leftJoinAndSelect('items.reason', 'reason')
      .leftJoinAndSelect('summary.voucherHeader', 'voucherHeader')
      .where('summary.businessStructureRef = :bsId', { bsId })
      .andWhere('summary.companyRef = :compId', { compId })
      .andWhere('summary.fiscalYearRef = :fiscalYearId', { fiscalYearId });
    return qb;
  }

  async findAll(options: any): Promise<[PettyCashSummary[], number]> {
    const qb = await this.getBuilder();
    applyDataGridParams(qb, options, 'summary');
    return qb.getManyAndCount();
  }

  async findById(id: number): Promise<PettyCashSummary | null> {
    const qb = await this.getBuilder();
    return qb.andWhere('summary.pettyCashSummaryId = :id', { id }).getOne();
  }

  async create(entity: PettyCashSummary): Promise<PettyCashSummary> {
    return this.repository.save(entity);
  }

  async update(id: number, entity: Partial<PettyCashSummary>): Promise<PettyCashSummary> {
    await this.repository.update({ pettyCashSummaryId: id } as any, entity);
    return this.findById(id) as Promise<PettyCashSummary>;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ pettyCashSummaryId: id } as any);
  }

  async isUsed(id: number): Promise<boolean> {
    return false;
  }

  async calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }> {
    const manager = this.repository.manager;
    let year = '1403';
    if (dateStr) {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
      const englishDateStr = dateStr
        .replace(/[۰-۹]/g, w => persianDigits.indexOf(w).toString())
        .replace(/[٠-٩]/g, w => arabicDigits.indexOf(w).toString());
      const match = englishDateStr.match(/^(\d{4})/);
      if (match) {
        year = match[1];
      }
    }

    let config = await manager.getRepository(EntityNumbering).findOne({
      where: {
        entityRef: 'petty_cash_summary',
        companyRef: companyId,
      }
    });

    if (!config) {
      config = await manager.getRepository(EntityNumbering).findOne({
        where: {
          entityRef: 'petty_cash_summary',
          businessStructureRef: businessStructureId,
        }
      });
    }

    let numberingMethod = '2'; // automatic
    let items: any = null;
    let baseNumbering = ['fiscalYear'];

    if (config) {
      numberingMethod = config.numberingMethod || '2';
      items = config.items;
      baseNumbering = Array.isArray(config.baseNumbering) ? config.baseNumbering : ['fiscalYear'];
    }

    let startNumber = 1;
    let endNumber = 999999;
    let fixedChar = '';

    if (items) {
      let fYears = items.fiscalYears || [];
      if (Array.isArray(items)) {
        fYears = items;
      }
      const matchYear = fYears.find((fy: any) => fy.fiscalYearTitle === year);
      if (matchYear) {
        startNumber = parseInt(matchYear.startNumber || '1', 10);
        endNumber = parseInt(matchYear.endNumber || '999999', 10);
        fixedChar = matchYear.fixedChar || '';
      }
    }

    const hasFiscalYearCheck = baseNumbering.includes('fiscalYear');
    let query = this.repository.createQueryBuilder('p')
      .where('p.companyRef = :companyId', { companyId })
      .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });

    if (hasFiscalYearCheck) {
      const startJ = `${year}/01/01`;
      const endJ = `${parseInt(year, 10) + 1}/01/01`;
      const startDate = momentJalaali(startJ, 'jYYYY/jMM/jDD').toDate();
      const endDate = momentJalaali(endJ, 'jYYYY/jMM/jDD').toDate();
      query = query.andWhere('p.date >= :startDate AND p.date < :endDate', { startDate, endDate });
    }

    const lastRecord = await query
      .orderBy('LENGTH(CAST(p.number AS VARCHAR))', 'DESC')
      .addOrderBy('CAST(p.number AS VARCHAR)', 'DESC')
      .getOne();

    let nextSeq = startNumber;
    if (lastRecord && lastRecord.number) {
      const lastValStr = String(lastRecord.number);
      let prefixStr = String(fixedChar || '');
      if (prefixStr && lastValStr.startsWith(prefixStr)) {
        const numPart = lastValStr.slice(prefixStr.length);
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      } else {
        const matchDigits = lastValStr.match(/\d+$/);
        if (matchDigits) {
          nextSeq = parseInt(matchDigits[0], 10) + 1;
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

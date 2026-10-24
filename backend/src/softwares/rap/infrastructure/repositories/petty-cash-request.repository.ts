import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PettyCashRequest } from '../../domain/entities/petty-cash-request.entity';
import { IPettyCashRequestRepository } from '../../domain/repositories/petty-cash-request.repository.interface';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';
import { EntityNumbering } from '../../../common/domain/entities/entity-numbering.entity';
import momentJalaali from 'moment-jalaali';

@Injectable()
export class PettyCashRequestRepository implements IPettyCashRequestRepository {
  private repository: Repository<PettyCashRequest>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(PettyCashRequest);
  }

  async create(data: Partial<PettyCashRequest>): Promise<PettyCashRequest> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<PettyCashRequest>): Promise<PettyCashRequest> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async findById(id: number): Promise<PettyCashRequest> {
    return this.repository.findOne({
      where: { pettyCashRequestId: id },
      relations: ['pettyCash', 'pettyCash.party', 'pettyCash.currency', 'pettyCashSummary']
    });
  }

  async findAll(options: any): Promise<[PettyCashRequest[], number]> {
    const qb = this.repository.createQueryBuilder('request')
      .leftJoinAndSelect('request.pettyCash', 'pettyCash')
      .leftJoinAndSelect('pettyCash.party', 'party')
      .leftJoinAndSelect('pettyCash.currency', 'currency')
      .leftJoinAndSelect('request.pettyCashSummary', 'pettyCashSummary');

    applyDataGridParams(qb, options, 'request');
    return qb.getManyAndCount();
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async generateNextNumber(businessStructureId: number, companyId: number, fiscalYearId: number): Promise<string> {
    const result = await this.repository.createQueryBuilder('request')
      .select('request.requestNumber', 'number')
      .where('request.businessStructureRef = :businessStructureId', { businessStructureId })
      .andWhere('request.companyRef = :companyId', { companyId })
      .andWhere('request.fiscalYearRef = :fiscalYearId', { fiscalYearId })
      .orderBy('LENGTH(request.requestNumber)', 'DESC')
      .addOrderBy('request.requestNumber', 'DESC')
      .getRawOne();
      
    const maxVal = result?.number ? parseInt(String(result.number).replace(/\D/g, ''), 10) : 0;
    return String(maxVal + 1);
  }

  async calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }> {
    try {
      const manager = this.repository.manager;
      let year = momentJalaali().format('jYYYY');
      
      if (dateStr) {
        // Normalize Persian/Arabic digits to English digits
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

      // Try to find numbering configuration: prioritized by companyRef
      let config = await manager.getRepository(EntityNumbering).findOne({
        where: { entityRef: 'petty_cash_request', companyRef: companyId }
      });

      if (!config) {
        config = await manager.getRepository(EntityNumbering).findOne({
          where: { entityRef: 'petty_cash_request', businessStructureRef: businessStructureId }
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
        if (Array.isArray(items)) fYears = items;
        
        const matchYear = fYears.find((fy: any) => String(fy.fiscalYearTitle || fy.fiscalYear) === String(year));
        if (matchYear) {
          startNumber = parseInt(matchYear.startNumber || '1', 10);
          endNumber = parseInt(matchYear.endNumber || '999999', 10);
          fixedChar = matchYear.fixedChar || '';
        }
      }

      const hasFiscalYearCheck = baseNumbering.includes('fiscalYear');
      const createBaseQuery = () => this.repository.createQueryBuilder('p')
        .where('p.companyRef = :companyId', { companyId })
        .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });

      let query = createBaseQuery();

      if (hasFiscalYearCheck) {
        const startJ = `${year}/01/01`;
        const endJ = `${parseInt(year, 10) + 1}/01/01`;
        
        const startDate = momentJalaali(startJ, 'jYYYY/jMM/jDD').toDate();
        const endDate = momentJalaali(endJ, 'jYYYY/jMM/jDD').toDate();
        
        query = query.andWhere('p.requestDate >= :startDate AND p.requestDate < :endDate', { startDate, endDate });
      }

      // Find the last record with a more robust query
      const lastRecord = await query
        .orderBy('LENGTH(CAST(p.requestNumber AS VARCHAR))', 'DESC')
        .addOrderBy('CAST(p.requestNumber AS VARCHAR)', 'DESC')
        .getOne();

      let nextSeq = startNumber;
      if (lastRecord && lastRecord.requestNumber) {
        const lastValStr = String(lastRecord.requestNumber);
        const prefixStr = String(fixedChar || '');
        
        if (prefixStr && lastValStr.startsWith(prefixStr)) {
          const numPart = lastValStr.slice(prefixStr.length);
          const parsed = parseInt(numPart.replace(/\D/g, ''), 10);
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

      if (nextSeq < startNumber) nextSeq = startNumber;

      if (nextSeq > endNumber) {
        return {
          numberingMethod,
          nextValue: '',
          error: `شماره تولید شده (${nextSeq}) از شماره پایانی تعریف شده (${endNumber}) در روش شماره گذاری برای سال ${year} تجاوز کرده است.`
        };
      }

      const formatted = String(fixedChar || '') + String(nextSeq);
      return { numberingMethod, nextValue: formatted };
    } catch (error: any) {
      console.error("Error in calculateNextDocumentNumber:", error);
      return {
        numberingMethod: '2',
        nextValue: '',
        error: `خطای داخلی سرور در محاسبه شماره: ${error.message}`
      };
    }
  }
}

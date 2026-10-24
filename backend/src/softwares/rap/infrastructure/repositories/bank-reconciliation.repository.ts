import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BankReconciliation } from '../../domain/entities/bank-reconciliation.entity';
import { IBankReconciliationRepository } from '../../domain/repositories/bank-reconciliation.repository.interface';
import { EntityNumbering } from '../../../common/domain/entities/entity-numbering.entity';
import momentJalaali from 'moment-jalaali';

@Injectable()
export class BankReconciliationRepository extends Repository<BankReconciliation> implements IBankReconciliationRepository {
  constructor(private dataSource: DataSource) {
    super(BankReconciliation, dataSource.createEntityManager());
  }

  async calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }> {
    const manager = this.manager;
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
        entityRef: 'bank_reconciliation',
        companyRef: companyId,
      }
    });

    if (!config) {
      config = await manager.getRepository(EntityNumbering).findOne({
        where: {
          entityRef: 'bank_reconciliation',
          businessStructureRef: businessStructureId,
        }
      });
    }

    let numberingMethod = '2'; // automatic
    let baseNumbering = ['fiscalYear'];
    let items: any = null;

    if (config) {
      numberingMethod = config.numberingMethod || '2';
      baseNumbering = Array.isArray(config.baseNumbering) ? config.baseNumbering : ['fiscalYear'];
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
      const matchYear = fYears.find((fy: any) => fy.fiscalYearTitle === year);
      if (matchYear) {
        startNumber = parseInt(matchYear.startNumber || '1', 10);
        endNumber = parseInt(matchYear.endNumber || '999999', 10);
        fixedChar = matchYear.fixedChar || '';
      }
    }

    const hasFiscalYearCheck = baseNumbering.includes('fiscalYear');
    let query = this.createQueryBuilder('p')
      .where('p.companyRef = :companyId', { companyId })
      .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });

    if (hasFiscalYearCheck) {
      const startJ = `${year}/01/01`;
      // We can use string comparison if dates are stored as YYYY/MM/DD
      const endJ = `${parseInt(year, 10) + 1}/01/01`;
      query = query.andWhere('p.Date >= :startJ AND p.Date < :endJ', { startJ, endJ });
    }

    const lastRecord = await query
      .orderBy('LENGTH(p.Number)', 'DESC')
      .addOrderBy('p.Number', 'DESC')
      .getOne();

    let nextSeq = startNumber;
    if (lastRecord && lastRecord.Number) {
      const lastValStr = String(lastRecord.Number);
      let prefixStr = String(fixedChar || '');
      if (prefixStr && lastValStr.startsWith(prefixStr)) {
        const numPartStr = lastValStr.substring(prefixStr.length);
        const parsed = parseInt(numPartStr, 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      } else {
        const parsed = parseInt(lastValStr, 10);
        if (!isNaN(parsed)) {
          nextSeq = parsed + 1;
        }
      }
    }

    if (nextSeq > endNumber) {
      return { numberingMethod, nextValue: '', error: 'شماره دهی فرم به پایان رسیده است' };
    }

    const prefixVal = String(fixedChar || '');
    return { numberingMethod, nextValue: prefixVal + String(nextSeq) };
  }
}

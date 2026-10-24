import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReconcileBankStatement } from '../../domain/entities/reconcile-bank-statement.entity';
import { IReconcileBankStatementRepository } from '../../domain/repositories/reconcile-bank-statement.repository.interface';
import { EntityNumbering } from '../../../common/domain/entities/entity-numbering.entity';
import momentJalaali from 'moment-jalaali';

@Injectable()
export class ReconcileBankStatementRepository implements IReconcileBankStatementRepository {
  constructor(
    @InjectRepository(ReconcileBankStatement)
    private readonly repository: Repository<ReconcileBankStatement>,
  ) {}

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
        entityRef: 'reconcile_bank_statement',
        companyRef: companyId,
      }
    });

    if (!config) {
      config = await manager.getRepository(EntityNumbering).findOne({
        where: {
          entityRef: 'reconcile_bank_statement',
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
    let query = this.repository.createQueryBuilder('p')
      .where('p.companyRef = :companyId', { companyId })
      .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });

    if (hasFiscalYearCheck) {
      const startJ = `${year}/01/01`;
      const endJ = `${parseInt(year, 10) + 1}/01/01`;
      const startDate = momentJalaali(startJ, 'jYYYY/jMM/jDD').toDate();
      const endDate = momentJalaali(endJ, 'jYYYY/jMM/jDD').toDate();
      query = query.andWhere('p.Date >= :startDate AND p.Date < :endDate', { startDate, endDate });
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

  async findAll(businessStructureRef: number, companyRef: number, fiscalYearRef: number): Promise<ReconcileBankStatement[]> {
    return this.repository.find({
      where: { businessStructureRef, companyRef, fiscalYearRef },
      relations: ['bankAccount'],
      order: { creationDate: 'DESC' },
    });
  }

  async findById(id: number, businessStructureRef: number, companyRef: number, fiscalYearRef: number): Promise<ReconcileBankStatement | null> {
    return this.repository.findOne({
      where: { ReconcileBankStatementID: id, businessStructureRef, companyRef, fiscalYearRef },
      relations: ['bankAccount', 'items'],
    });
  }

  async create(data: ReconcileBankStatement): Promise<ReconcileBankStatement> {
    return this.repository.save(data);
  }

  async update(data: ReconcileBankStatement): Promise<ReconcileBankStatement> {
    return this.repository.save(data);
  }

  async delete(id: number, businessStructureRef: number, companyRef: number): Promise<void> {
    await this.repository.delete({ ReconcileBankStatementID: id, businessStructureRef, companyRef });
  }

  async findLatestByBankAccount(bankAccountRef: number, businessStructureRef: number, companyRef: number): Promise<ReconcileBankStatement | null> {
    return this.repository.findOne({
      where: {
        BankAccountRef: bankAccountRef,
        businessStructureRef,
        companyRef,
      },
      order: {
        Date: 'DESC',
        creationDate: 'DESC',
      },
    });
  }
}

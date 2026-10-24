import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import momentJalaali from 'moment-jalaali';
import { ReceivedChequeOperation } from '../../domain/entities/received-cheque-operation.entity';
import { IReceivedChequeOperationRepository } from '../../domain/repositories/received-cheque-operation.repository.interface';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';

@Injectable()
export class ReceivedChequeOperationRepository implements IReceivedChequeOperationRepository {
  constructor(
    @InjectRepository(ReceivedChequeOperation)
    private readonly repo: Repository<ReceivedChequeOperation>,
  ) {}

  async create(data: Partial<ReceivedChequeOperation>): Promise<ReceivedChequeOperation> {
    const entity = this.repo.create({
      ...data,
    });
    return await this.repo.save(entity);
  }

  async update(id: number, data: Partial<ReceivedChequeOperation>): Promise<ReceivedChequeOperation> {
    const entity = await this.findById(id);
    if (!entity) throw new Error('ReceivedChequeOperation not found');
    
    if (data.items) {
      const { ReceivedChequeOperationItem } = require('../../domain/entities/received-cheque-operation-item.entity');
      await this.repo.manager.delete(ReceivedChequeOperationItem, { operationRef: id });
      entity.items = [];
    }

    // For updating relations like items, TypeORM save handles it if cascade is true
    Object.assign(entity, data);
    return await this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findById(id: number): Promise<ReceivedChequeOperation | null> {
    return await this.repo.findOne({ 
      where: { receivedChequeOperationId: id },
      relations: [
        'items', 
        'items.receiptCheque', 
        'items.receiptCheque.receiptNotification', 
        'items.receiptCheque.receiptNotification.party', 
        'bankAccount', 
        'realizer', 
        'items.cash', 
        'voucherHeader'
      ]
    });
  }

  async calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }> {
    const manager = this.repo.manager;
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

    const { EntityNumbering } = require('../../../common/domain/entities/entity-numbering.entity');

    let config = await manager.getRepository(EntityNumbering).findOne({
      where: {
        entityRef: 'received_cheque_operation',
        companyRef: companyId,
      }
    });

    if (!config) {
      config = await manager.getRepository(EntityNumbering).findOne({
        where: {
          entityRef: 'received_cheque_operation',
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
    let query = this.repo.createQueryBuilder('p')
      .where('p.companyRef = :companyId', { companyId })
      .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });

    if (hasFiscalYearCheck) {
      const startJ = `${year}/01/01`;
      const endJ = `${parseInt(year, 10) + 1}/01/01`;
      const startDate = momentJalaali(startJ, 'jYYYY/jMM/jDD').toDate();
      const endDate = momentJalaali(endJ, 'jYYYY/jMM/jDD').toDate();
      query = query.andWhere('p.documentDate >= :startDate AND p.documentDate < :endDate', { startDate, endDate });
    }

    const lastRecord = await query
      .orderBy('LENGTH(p.documentNumber)', 'DESC')
      .addOrderBy('p.documentNumber', 'DESC')
      .getOne();

    let nextSeq = startNumber;
    if (lastRecord && lastRecord.documentNumber) {
      const lastValStr = String(lastRecord.documentNumber);
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

  async findAll(filters?: any): Promise<[ReceivedChequeOperation[], number]> {
    let query = this.repo.createQueryBuilder('op')
      .leftJoinAndSelect('op.items', 'items')
      .leftJoinAndSelect('items.receiptCheque', 'receiptCheque')
      .leftJoinAndSelect('receiptCheque.receiptNotification', 'receiptNotification')
      .leftJoinAndSelect('receiptNotification.party', 'party')
      .leftJoinAndSelect('op.bankAccount', 'bankAccount')
      .leftJoinAndSelect('op.realizer', 'realizer')
      .leftJoinAndSelect('op.voucherHeader', 'voucherHeader');

    if (filters) {
      if (filters.companyRef) {
        query = query.andWhere('op.companyRef = :companyRef', { companyRef: filters.companyRef });
      }
      if (filters.businessStructureRef) {
        query = query.andWhere('op.businessStructureRef = :businessStructureRef', { businessStructureRef: filters.businessStructureRef });
      }
      if (filters.fiscalYearRef) {
        query = query.andWhere('op.fiscalYearRef = :fiscalYearRef', { fiscalYearRef: filters.fiscalYearRef });
      }
      query = applyDataGridParams(query, filters, 'op');
    }

    query = query.orderBy('op.creationDate', 'DESC');
    
    if (filters?.skip !== undefined) query = query.skip(filters.skip);
    if (filters?.take !== undefined) query = query.take(filters.take);

    return await query.getManyAndCount();
  }
}

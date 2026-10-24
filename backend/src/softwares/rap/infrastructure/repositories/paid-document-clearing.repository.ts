import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import momentJalaali from 'moment-jalaali';
import { PaidDocumentClearing } from '../../domain/entities/paid-document-clearing.entity';
import { IPaidDocumentClearingRepository } from '../../domain/repositories/paid-document-clearing.repository.interface';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';

@Injectable()
export class PaidDocumentClearingRepository implements IPaidDocumentClearingRepository {
  constructor(
    @InjectRepository(PaidDocumentClearing)
    private readonly repo: Repository<PaidDocumentClearing>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async create(data: Partial<PaidDocumentClearing>): Promise<PaidDocumentClearing> {
    const entity = this.repo.create(data);
    return await this.repo.save(entity);
  }

  async update(id: number, data: Partial<PaidDocumentClearing>): Promise<void> {
    const existing = await this.repo.findOne({ where: { paidDocumentClearingId: id } as any });
    if (!existing) {
      throw new Error('Record not found.');
    }
    await this.repo.save({ ...existing, ...data });
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }

  async findById(id: number): Promise<PaidDocumentClearing | null> {
    return await this.repo.findOne({ 
      where: { paidDocumentClearingId: id } as any,
      relations: ['voucherHeader']
    });
  }

  async findAll(): Promise<PaidDocumentClearing[]> {
    return await this.repo.find();
  }

  async findAdvanced(params: any): Promise<[PaidDocumentClearing[], number]> {
    let query = this.repo.createQueryBuilder('e');
    query = applyDataGridParams(query, params, 'e');
    if (params?.skip !== undefined) query = query.skip(params.skip);
    if (params?.take !== undefined) query = query.take(params.take);
    return await query.getManyAndCount();
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    const qb = this.repo.createQueryBuilder('e').where(`e.${field} = :value`, { value });
    if (excludeId) {
      qb.andWhere(`e.paidDocumentClearingId != :id`, { id: excludeId });
    }
    const count = await qb.getCount();
    return count > 0;
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
        entityRef: 'paid_document_clearing',
        companyRef: companyId,
      }
    });

    if (!config) {
      config = await manager.getRepository(EntityNumbering).findOne({
        where: {
          entityRef: 'paid_document_clearing',
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
      query = query.andWhere('p.date >= :startDate AND p.date < :endDate', { startDate, endDate });
    }

    const lastRecord = await query
      .orderBy('LENGTH(p.number)', 'DESC')
      .addOrderBy('p.number', 'DESC')
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

  async findAllCustom(filters?: any): Promise<[PaidDocumentClearing[], number]> {
    let query = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.items', 'items')
      .leftJoinAndSelect('p.bankAccount', 'bankAccount')
      .leftJoinAndSelect('p.voucherHeader', 'voucherHeader');

    if (filters) {
      if (filters.companyRef) {
        query = query.andWhere('p.companyRef = :companyRef', { companyRef: filters.companyRef });
      }
      if (filters.businessStructureRef) {
        query = query.andWhere('p.businessStructureRef = :businessStructureRef', { businessStructureRef: filters.businessStructureRef });
      }
      if (filters.fiscalYearRef) {
        query = query.andWhere('p.fiscalYearRef = :fiscalYearRef', { fiscalYearRef: filters.fiscalYearRef });
      }
      query = applyDataGridParams(query, filters, 'p');
    }

    query = query.orderBy('p.creationDate', 'DESC');
    
    if (filters?.skip !== undefined) query = query.skip(filters.skip);
    if (filters?.take !== undefined) query = query.take(filters.take);

    return await query.getManyAndCount();
  }

  async findByIdCustom(id: number): Promise<PaidDocumentClearing | null> {
    const clearing = await this.repo.findOne({ 
      where: { paidDocumentClearingId: id },
      relations: ['items', 'bankAccount', 'voucherHeader']
    });

    if (clearing && clearing.items) {
      for (const item of clearing.items) {
        if (item.documentType === 'cheque' && item.documentId) {
          const rawData = await this.repo.manager.query(
            `
            SELECT 
              pc."PaymentChequeID" AS "paymentChequeId",
              pc."PaymentChequeID" AS id,
              pc."Amount" AS amount,
              pc."ChequeNumber" AS "chequeNumber",
              asg."Title" AS "accountingOperationTitle",
              rr."Title" AS "reasonTitle",
              CASE
                WHEN cbItem."Receiver" IS NOT NULL AND cbItem."Receiver" != '' THEN cbItem."Receiver"
                WHEN pn."PaymentType" IN (3, 5) THEN ba."Title"
                WHEN pn."PaymentType" IN (4, 6) THEN c."Title"
                ELSE COALESCE(da."Title", TRIM(CONCAT(COALESCE(party."FirstName", ''), ' ', COALESCE(party."LastName", ''))))
              END AS "receiverName",
              cbItem."IssueDate" AS "dueDate",
              cbItem."IssueDate" AS "issueDate"
            FROM "Rap"."PaymentCheque" pc
            JOIN "Rap"."PaymentNotifications" pn ON pc."PaymentNotificationRef" = pn."PaymentNotificationID"
            LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" asg ON pc."AccountingSettingRef" = asg."RecieptAndPaymentAccountingSettingID"
            LEFT JOIN "Rap"."Reasons" rr ON pc."ReasonRef" = rr."RapReasonID"
            LEFT JOIN "Gnr"."Parties" party ON pn."PartyRef" = party."PartyID"
            LEFT JOIN "Acc"."DetailedAccounts" da ON party."DetailedAccountID" = da."DetailedAccountID"
            LEFT JOIN "Rap"."BankAccounts" ba ON pn."PartyRef" = ba."BankAccountID"
            LEFT JOIN "Rap"."Cashes" c ON pn."PartyRef" = c."CashID"
            LEFT JOIN "Rap"."ChequebookItems" cbItem ON (pc."ChequebookRef" = cbItem."ChequebookRef" AND CAST(pc."ChequeNumber" AS bigint) = cbItem."CheckNumber")
            WHERE pc."PaymentChequeID" = $1
            `,
            [item.documentId]
          );
          if (rawData && rawData.length > 0) {
            (item as any).document = rawData[0];
          }
        } else if (item.documentType === 'promissory_note' && item.documentId) {
          const rawData = await this.repo.manager.query(
            `
            SELECT 
              ppn."PaymentPromissoryNoteID" AS "paymentPromissoryNoteId",
              ppn."PaymentPromissoryNoteID" AS id,
              ppn."Amount" AS amount,
              pni."ItemNumber" AS "noteNumber",
              asg."Title" AS "accountingOperationTitle",
              rr."Title" AS "reasonTitle",
              CASE
                WHEN pn."PaymentType" IN (3, 5) THEN ba."Title"
                WHEN pn."PaymentType" IN (4, 6) THEN c."Title"
                ELSE COALESCE(da."Title", TRIM(CONCAT(COALESCE(party."FirstName", ''), ' ', COALESCE(party."LastName", ''))))
              END AS "receiverName",
              ppn."DueDate" AS "dueDate"
            FROM "Rap"."PaymentPromissoryNote" ppn
            JOIN "Rap"."PaymentNotifications" pn ON ppn."PaymentNotificationRef" = pn."PaymentNotificationID"
            LEFT JOIN "Rap"."RecieptAndPaymentAccountingSetting" asg ON ppn."AccountingSettingRef" = asg."RecieptAndPaymentAccountingSettingID"
            LEFT JOIN "Rap"."Reasons" rr ON ppn."ReasonRef" = rr."RapReasonID"
            LEFT JOIN "Gnr"."Parties" party ON pn."PartyRef" = party."PartyID"
            LEFT JOIN "Acc"."DetailedAccounts" da ON party."DetailedAccountID" = da."DetailedAccountID"
            LEFT JOIN "Rap"."BankAccounts" ba ON pn."PartyRef" = ba."BankAccountID"
            LEFT JOIN "Rap"."Cashes" c ON pn."PartyRef" = c."CashID"
            LEFT JOIN "Rap"."PromissoryNoteItems" pni ON ppn."PromissoryNoteItemRef" = pni."PromissoryNoteItemID"
            WHERE ppn."PaymentPromissoryNoteID" = $1
            `,
            [item.documentId]
          );
          if (rawData && rawData.length > 0) {
            (item as any).document = rawData[0];
          }
        }
        
        // ensure bank_account format uses the relation or custom map
      }
    }
    if (clearing && clearing.bankAccount) {
      (clearing as any).bank_account = {
         id: clearing.bankAccount.bankAccountId,
         bankAccountId: clearing.bankAccount.bankAccountId,
         title: clearing.bankAccount.title
      };
    }
    return clearing;
  }
}

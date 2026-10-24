import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PettyCash } from '../../domain/entities/petty-cash.entity';
import { IPettyCashRepository } from '../../domain/repositories/petty-cash.repository.interface';

@Injectable()
export class PettyCashRepository implements IPettyCashRepository {
  constructor(
    @InjectRepository(PettyCash)
    private repository: Repository<PettyCash>,
  ) {}

  private async calculateCurrentBalance(pettyCash: PettyCash, fiscalYearId: number): Promise<void> {
    if (!pettyCash.partyRef) return;
    
    // Sum of PaymentNotifications (شارژ تنخواه = 2)
    const paymentsRows = await this.repository.query(`
      SELECT SUM(item."Amount") as amount
      FROM (
        SELECT "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentWithdrawal"
        UNION ALL
        SELECT "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentCash"
        UNION ALL
        SELECT "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentCheque"
        UNION ALL
        SELECT "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentAssignment"
        UNION ALL
        SELECT "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentPromissoryNote"
      ) item
      INNER JOIN "Rap"."PaymentNotifications" pn ON pn."PaymentNotificationID" = item."PaymentNotificationRef"
      WHERE pn."PaymentType" = 2
        AND pn."PartyRef" = $1
        AND pn."FiscalYearRef" = $2
        AND pn."DocumentDate" <= CURRENT_DATE
    `, [pettyCash.partyRef, fiscalYearId]);
    const paymentsTotal = Number(paymentsRows[0]?.amount || 0);

    // Sum of ReceiptNotifications (تسویه تنخواه)
    const receiptsRows = await this.repository.query(`
      SELECT SUM(item."Amount") as amount
      FROM (
        SELECT "Amount", "ReceiptNotificationRef" FROM "Rap"."ReceiptDeposit"
        UNION ALL
        SELECT "Amount", "ReceiptNotificationRef" FROM "Rap"."ReceiptCash"
        UNION ALL
        SELECT "Amount", "ReceiptNotificationRef" FROM "Rap"."ReceiptCheque"
        UNION ALL
        SELECT "Amount", "ReceiptNotificationRef" FROM "Rap"."ReceiptPromissoryNote"
      ) item
      INNER JOIN "Rap"."ReceiptNotifications" rn ON rn."ReceiptNotificationID" = item."ReceiptNotificationRef"
      WHERE rn."ReceiptType" = 'تسویه تنخواه'
        AND rn."PartyRef" = $1
        AND rn."FiscalYearRef" = $2
        AND rn."DocumentDate" <= CURRENT_DATE
    `, [pettyCash.partyRef, fiscalYearId]);
    const receiptsTotal = Number(receiptsRows[0]?.amount || 0);

    // Sum of PettyCashSummaries
    const summariesRows = await this.repository.query(`
      SELECT SUM(item."Amount") as amount
      FROM "Rap"."PettyCashSummaryItems" item
      INNER JOIN "Rap"."PettyCashSummaries" pcs ON pcs."pettyCashSummaryId" = item."PettyCashSummaryRef"
      WHERE pcs."PettyCashRef" = $1
        AND pcs."FiscalYearRef" = $2
        AND pcs."Date" <= CURRENT_DATE
    `, [pettyCash.pettyCashId, fiscalYearId]);
    const summariesTotal = Number(summariesRows[0]?.amount || 0);

    pettyCash.currentBalance = Number(pettyCash.initialBalance || 0) + paymentsTotal - receiptsTotal - summariesTotal;
  }

  async findAll(companyId: number, businessStructureId: number, fiscalYearId: number): Promise<PettyCash[]> {
    let isShared = true;
    try {
      const rows = await this.repository.manager.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [businessStructureId]
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

    const where: any = isShared ? { businessStructureRef: businessStructureId } : { companyRef: companyId };
    const records = await this.repository.find({
      where,
      relations: ['party', 'account', 'currency'],
      order: { pettyCashId: 'ASC' },
    });
    await Promise.all(records.map(r => this.calculateCurrentBalance(r, fiscalYearId)));
    return records;
  }

  async findById(id: number, fiscalYearId: number): Promise<PettyCash | null> {
    const record = await this.repository.findOne({ 
      where: { pettyCashId: id },
      relations: ['account', 'party', 'currency']
    });
    if (record) {
      await this.calculateCurrentBalance(record, fiscalYearId);
    }
    return record;
  }

  async create(entity: PettyCash): Promise<PettyCash> {
    if (!entity.businessStructureRef || entity.businessStructureRef <= 1) entity.businessStructureRef = 2;
    if (!entity.companyRef || entity.companyRef <= 1) entity.companyRef = 2;
    return this.repository.save(entity);
  }

  async update(entity: PettyCash): Promise<PettyCash> {
    return this.repository.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
  
  async isUsed(id: number): Promise<boolean> {
      return false;
  }
}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { BankAccount } from '../../domain/entities/bank-account.entity';
import { VoucherItem } from '../../../accounting/domain/entities/voucher-item.entity';
import { ReceiptDeposit } from '../../domain/entities/receipt-deposit.entity';
import { PaymentWithdrawal } from '../../domain/entities/payment-withdrawal.entity';
import { ReceivedChequeOperation } from '../../domain/entities/received-cheque-operation.entity';
import { PaidDocumentClearing } from '../../domain/entities/paid-document-clearing.entity';
import { PaymentCheque } from '../../domain/entities/payment-cheque.entity';
import { Cash } from '../../domain/entities/cash.entity';
import { ReceiptCash } from '../../domain/entities/receipt-cash.entity';
import { PaymentCash } from '../../domain/entities/payment-cash.entity';
import { ReceiptCheque } from '../../domain/entities/receipt-cheque.entity';
import { ReceivedChequeOperationItem } from '../../domain/entities/received-cheque-operation-item.entity';
import { PaidDocumentClearingItem } from '../../domain/entities/paid-document-clearing-item.entity';
import { PaymentReturnedReceivedCheque } from '../../domain/entities/payment-returned-received-cheque.entity';
import { ReceiptReturnedPaymentAssignment } from '../../domain/entities/receipt-returned-payment-assignment.entity';
import { PaymentAssignment } from '../../domain/entities/payment-assignment.entity';
import { ReceiptPromissoryNote } from '../../domain/entities/receipt-promissory-note.entity';
import { PaymentReturnedReceivedPromissoryNote } from '../../domain/entities/payment-returned-received-promissory-note.entity';
import { FiscalYear } from '../../../common/domain/entities/fiscal-year.entity';
import { PettyCash } from '../../domain/entities/petty-cash.entity';
import { PaymentNotification } from '../../domain/entities/payment-notification.entity';
import moment from 'moment-jalaali';

@Controller('rap/rap-review')
@UseGuards(JwtAuthGuard)
export class RapReviewController {
  constructor(
    @InjectRepository(BankAccount)
    private readonly bankAccountRepository: Repository<BankAccount>,
    @InjectRepository(VoucherItem)
    private readonly voucherItemRepository: Repository<VoucherItem>,
    @InjectRepository(ReceiptDeposit)
    private readonly receiptDepositRepository: Repository<ReceiptDeposit>,
    @InjectRepository(PaymentWithdrawal)
    private readonly paymentWithdrawalRepository: Repository<PaymentWithdrawal>,
    @InjectRepository(ReceivedChequeOperation)
    private readonly receivedChequeOperationRepository: Repository<ReceivedChequeOperation>,
    @InjectRepository(PaidDocumentClearing)
    private readonly paidDocumentClearingRepository: Repository<PaidDocumentClearing>,
    @InjectRepository(Cash)
    private readonly cashRepository: Repository<Cash>,
    @InjectRepository(ReceiptCash)
    private readonly receiptCashRepository: Repository<ReceiptCash>,
    @InjectRepository(PaymentCash)
    private readonly paymentCashRepository: Repository<PaymentCash>,
    @InjectRepository(ReceiptCheque)
    private readonly receiptChequeRepository: Repository<ReceiptCheque>,
    @InjectRepository(ReceivedChequeOperationItem)
    private readonly receivedChequeOperationItemRepository: Repository<ReceivedChequeOperationItem>,
    @InjectRepository(PaymentAssignment)
    private readonly paymentAssignmentRepository: Repository<PaymentAssignment>,
    @InjectRepository(ReceiptReturnedPaymentAssignment)
    private readonly receiptReturnedPaymentAssignmentRepository: Repository<ReceiptReturnedPaymentAssignment>,
    @InjectRepository(PaymentCheque)
    private readonly paymentChequeRepository: Repository<PaymentCheque>,
    @InjectRepository(PaidDocumentClearingItem)
    private readonly paidDocumentClearingItemRepository: Repository<PaidDocumentClearingItem>,
    @InjectRepository(PaymentReturnedReceivedCheque)
    private readonly paymentReturnedReceivedChequeRepository: Repository<PaymentReturnedReceivedCheque>,
    @InjectRepository(ReceiptPromissoryNote)
    private readonly receiptPromissoryNoteRepository: Repository<ReceiptPromissoryNote>,
    @InjectRepository(PaymentReturnedReceivedPromissoryNote)
    private readonly paymentReturnedReceivedPromissoryNoteRepository: Repository<PaymentReturnedReceivedPromissoryNote>,
    @InjectRepository(PettyCash)
    private readonly pettyCashRepository: Repository<PettyCash>,
    @InjectRepository(PaymentNotification)
    private readonly paymentNotificationRepository: Repository<PaymentNotification>,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async isBasicInfoShared(bsId: any): Promise<boolean> {
    try {
      const rows = await this.cashRepository.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [Number(bsId)]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          return false;
        }
        return true;
      }
    } catch (err) {}
    return false;
  }

  @Get('history')
  async getHistory(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('selectedId') selectedId: string,
    @Query('verticalType') verticalType?: string,
    @Query('verticalValue') verticalValue?: string,
    @Query('horizontalType') horizontalType?: string,
    @Query('cellFilter') cellFilter?: string,
    @Query('pathStr') pathStr?: string,
    @Query('pathIds') pathIds?: string,
  ) {
    const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    const compId = this.requestContextService.getCompanyId() ?? 2;

    const normalizeDigits = (str: string) => str ? str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()) : str;
    const finalFromDate = normalizeDigits(fromDate);
    const finalToDate = normalizeDigits(toDate);

    const reportData: any[] = [];

    // Fetch all VoucherItems for matching
    const voucherItems = await this.voucherItemRepository
      .createQueryBuilder('item')
      .innerJoinAndSelect('item.voucher', 'v')
      .where('v.companyRef = :compId', { compId })
      .andWhere('v.businessStructureRef = :bsId', { bsId })
      .getMany();

    const voucherMapByTracking = new Map<string, any>();
    const voucherMapByDocNumber = new Map<string, any>();

    voucherItems.forEach(item => {
      if (item.trackingNumber) {
        const cleanTrack = item.trackingNumber.trim();
        if (!voucherMapByTracking.has(cleanTrack)) {
          voucherMapByTracking.set(cleanTrack, item.voucher);
        }
      }
      if (item.voucher?.referenceNumber) {
        const cleanRef = item.voucher.referenceNumber.trim();
        if (!voucherMapByDocNumber.has(cleanRef)) {
          voucherMapByDocNumber.set(cleanRef, item.voucher);
        }
      }
    });

    const findVoucher = (trackingNumber?: string, docNumber?: string) => {
      if (trackingNumber) {
        const clean = trackingNumber.trim();
        if (voucherMapByTracking.has(clean)) return voucherMapByTracking.get(clean);
        if (voucherMapByDocNumber.has(clean)) return voucherMapByDocNumber.get(clean);
      }
      if (docNumber) {
        const clean = docNumber.trim();
        if (voucherMapByTracking.has(clean)) return voucherMapByTracking.get(clean);
        if (voucherMapByDocNumber.has(clean)) return voucherMapByDocNumber.get(clean);
      }
      return null;
    };

    const cleanVerticalType = Array.isArray(verticalType) ? (verticalType as any)[0] : verticalType;
    const cleanHorizontalType = Array.isArray(horizontalType) ? (horizontalType as any)[0] : horizontalType;

    if (cleanVerticalType === 'bank_account' && cleanHorizontalType === 'cash') {
      const bankId = Number(verticalValue);
      const cashId = Number(selectedId);

      // 1. Bank to Cash Payments
      const bankToCashQuery = this.paymentWithdrawalRepository
        .createQueryBuilder('pw')
        .innerJoinAndSelect('pw.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pw.bankAccountRef = :bankId', { bankId })
        .andWhere('pn.partyRef = :cashId', { cashId })
        .andWhere('pn.paymentType = :paymentType', { paymentType: 4 })
        .andWhere('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        bankToCashQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        bankToCashQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const bankToCashList = await bankToCashQuery.getMany();

      bankToCashList.forEach((pw, idx) => {
        reportData.push({
          id: `btc_pm_${pw.paymentWithdrawalId}_${idx}`,
          paymentNotificationId: pw.paymentNotification?.paymentNotificationId,
          documentType: 'اعلامیه پرداخت',
          transactionType: 'انتقال از بانک به صندوق',
          documentNumber: pw.paymentNotification?.documentNumber || '',
          documentDate: pw.paymentNotification?.documentDate ? new Date(pw.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: '',
          itemDate: pw.paymentNotification?.documentDate ? new Date(pw.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(pw.amount || 0),
          receivedAmount: Number(pw.amount || 0), // Deposit to Cash
          paidAmount: 0,
          description: pw.description || pw.paymentNotification?.description || '',
          counterpartyName: 'انتقال داخلی',
          currencyName: pw.paymentNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: pw.paymentNotification?.documentDate ? new Date(pw.paymentNotification.documentDate).getTime() : 0,
        });
      });

      // 2. Bank to Cash Receipts (if any)
      const bankToCashReceiptQuery = this.receiptCashRepository
        .createQueryBuilder('rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.currency', 'currency')
        .innerJoinAndSelect('rn.depositItems', 'di')
        .where('di.bankAccountRef = :bankId', { bankId })
        .andWhere('rc.cashRef = :cashId', { cashId })
        .andWhere('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        bankToCashReceiptQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        bankToCashReceiptQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const bankToCashReceiptList = await bankToCashReceiptQuery.getMany();

      bankToCashReceiptList.forEach((rc, idx) => {
        reportData.push({
          id: `btc_rc_${rc.receiptCashId}_${idx}`,
          receiptNotificationId: rc.receiptNotification?.receiptNotificationId,
          documentType: 'رسید دریافت',
          transactionType: 'انتقال از بانک به صندوق',
          documentNumber: rc.receiptNotification?.documentNumber || '',
          documentDate: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: '',
          itemDate: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(rc.amount || 0),
          receivedAmount: Number(rc.amount || 0), // Deposit to Cash
          paidAmount: 0,
          description: rc.description || rc.receiptNotification?.description || '',
          counterpartyName: 'انتقال داخلی',
          currencyName: rc.receiptNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).getTime() : 0,
        });
      });

      // 3. Cash to Bank Payments
      const cashToBankQuery = this.paymentCashRepository
        .createQueryBuilder('pc')
        .innerJoinAndSelect('pc.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.paymentType = 5')
        .andWhere('pn.partyRef = :bankId', { bankId })
        .andWhere('pc.cashRef = :cashId', { cashId })
        .andWhere('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        cashToBankQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        cashToBankQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const cashToBankList = await cashToBankQuery.getMany();

      cashToBankList.forEach((pc, idx) => {
        reportData.push({
          id: `ctb_pm_${pc.paymentCashId}_${idx}`,
          paymentNotificationId: pc.paymentNotification?.paymentNotificationId,
          documentType: 'اعلامیه پرداخت',
          transactionType: 'انتقال از صندوق به بانک',
          documentNumber: pc.paymentNotification?.documentNumber || '',
          documentDate: pc.paymentNotification?.documentDate ? new Date(pc.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: '',
          itemDate: pc.paymentNotification?.documentDate ? new Date(pc.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(pc.amount || 0),
          receivedAmount: 0,
          paidAmount: Number(pc.amount || 0), // Withdrawal from Cash
          description: pc.description || pc.paymentNotification?.description || '',
          counterpartyName: 'انتقال داخلی',
          currencyName: pc.paymentNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: pc.paymentNotification?.documentDate ? new Date(pc.paymentNotification.documentDate).getTime() : 0,
        });
      });

      // 4. Cash to Bank Receipts
      const cashToBankReceiptQuery = this.receiptDepositRepository
        .createQueryBuilder('rd')
        .innerJoinAndSelect('rd.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.currency', 'currency')
        .innerJoinAndSelect('rn.cashItems', 'rc')
        .where('rd.bankAccountRef = :bankId', { bankId })
        .andWhere('rc.cashRef = :cashId', { cashId })
        .andWhere('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        cashToBankReceiptQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        cashToBankReceiptQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const cashToBankReceiptList = await cashToBankReceiptQuery.getMany();

      cashToBankReceiptList.forEach((rd, idx) => {
        const v = findVoucher(rd.trackingNumber, rd.receiptNotification?.documentNumber);
        const matchingCash = rd.receiptNotification?.cashItems?.find(rc => Number(rc.cashRef) === cashId);
        const amt = Number(matchingCash?.amount || rd.amount || 0);
        reportData.push({
          id: `ctb_rc_${rd.receiptDepositId}_${idx}`,
          receiptNotificationId: rd.receiptNotification?.receiptNotificationId,
          documentType: 'رسید دریافت',
          transactionType: 'انتقال از صندوق به بانک',
          documentNumber: rd.receiptNotification?.documentNumber || '',
          documentDate: rd.receiptNotification?.documentDate ? new Date(rd.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: rd.trackingNumber || '',
          itemDate: rd.receiptNotification?.documentDate ? new Date(rd.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          amount: amt,
          receivedAmount: 0,
          paidAmount: amt, // Withdrawal from Cash
          description: rd.description || rd.receiptNotification?.description || '',
          counterpartyName: 'انتقال داخلی',
          currencyName: rd.receiptNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: rd.receiptNotification?.documentDate ? new Date(rd.receiptNotification.documentDate).getTime() : 0,
        });
      });

      // Sort by date
      reportData.sort((a, b) => a.timestamp - b.timestamp);

      return {
        success: true,
        reportData
      };
    }

    if (cleanVerticalType === 'bank_account' && cleanHorizontalType === 'counterparty') {
      const bankId = Number(verticalValue);
      const parts = String(selectedId).split('_');
      const partyId = Number(parts[0]);
      const currencyId = parts.length > 1 && parts[1] !== 'null' && parts[1] !== 'undefined' ? Number(parts[1]) : null;

      const reportData: any[] = [];
      const { PaymentCheque } = await import('../../domain/entities/payment-cheque.entity');

      if (cellFilter === 'receipt_cheques' || cellFilter === 'inCollection' || cellFilter === 'collected' || cellFilter === 'protested') {
        const rcQuery = this.receiptChequeRepository.createQueryBuilder('rc')
          .innerJoinAndSelect('rc.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.currency', 'currency')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId })
          .andWhere('rn.partyRef = :partyId', { partyId });
          
        if (cellFilter !== 'receipt_cheques') {
           const opType = cellFilter === 'inCollection' ? 1 : cellFilter === 'collected' ? 2 : 3;
           const { ReceivedChequeOperationItem } = await import('../../domain/entities/received-cheque-operation-item.entity');
           rcQuery.innerJoin(ReceivedChequeOperationItem, 'opItem', 'opItem.receiptChequeRef = rc.receiptChequeId')
                  .innerJoin('opItem.operation', 'op')
                  .andWhere('op.operationType = :opType', { opType })
                  .andWhere('op.bankAccountRef = :bankId', { bankId });
        }

        if (currencyId !== null) rcQuery.andWhere('rn.currencyRef = :currencyId', { currencyId });
        if (finalFromDate) rcQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) rcQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

        const rcList = await rcQuery.getMany();
        rcList.forEach((rc, idx) => {
          const v = findVoucher(rc.chequeNumber, rc.receiptNotification?.documentNumber);
          reportData.push({
            id: `rc_${rc.receiptChequeId}_${idx}`,
            documentType: 'رسید دریافت',
            transactionType: 'چک',
            documentNumber: rc.receiptNotification?.documentNumber || '',
            documentDate: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: rc.chequeNumber || '',
            itemDate: rc.dueDate ? new Date(rc.dueDate).toISOString().split('T')[0] : '',
            amount: Number(rc.amount || 0),
            receivedAmount: Number(rc.amount || 0),
            description: rc.description || '',
            currencyName: rc.receiptNotification?.currency?.title || '',
            
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).getTime() : 0,
          });
        });
        
        const rpnQuery = this.receiptPromissoryNoteRepository.createQueryBuilder('rpn')
          .innerJoinAndSelect('rpn.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.currency', 'currency')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId })
          .andWhere('rn.partyRef = :partyId', { partyId });
        if (currencyId !== null) rpnQuery.andWhere('rn.currencyRef = :currencyId', { currencyId });
        if (finalFromDate) rpnQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) rpnQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
        
        const rpnList = await rpnQuery.getMany();
        rpnList.forEach((rpn, idx) => {
          reportData.push({
            id: `rpn_${rpn.receiptPromissoryNoteId}_${idx}`,
            documentType: 'رسید دریافت',
            transactionType: 'سفته',
            documentNumber: rpn.receiptNotification?.documentNumber || '',
            documentDate: rpn.receiptNotification?.documentDate ? new Date(rpn.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: rpn.promissoryNoteNumber || '',
            itemDate: '',
            amount: Number(rpn.amount || 0),
            receivedAmount: Number(rpn.amount || 0),
            description: rpn.description || '',
            currencyName: rpn.receiptNotification?.currency?.title || '',
            
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: rpn.receiptNotification?.documentDate ? new Date(rpn.receiptNotification.documentDate).getTime() : 0,
          });
        });
        
        reportData.sort((a, b) => a.timestamp - b.timestamp);
        return { success: true, reportData };
      }

      if (cellFilter === 'payment_cheques') {
        const pcQuery = this.paymentChequeRepository.createQueryBuilder('pc')
          .innerJoinAndSelect('pc.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.currency', 'currency')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId })
          .andWhere('pn.partyRef = :partyId', { partyId })
          .andWhere('pc.bankAccountRef = :bankId', { bankId });
        if (currencyId !== null) pcQuery.andWhere('pn.currencyRef = :currencyId', { currencyId });
        if (finalFromDate) pcQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) pcQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const pcList = await pcQuery.getMany();
        pcList.forEach((pc, idx) => {
          reportData.push({
            id: `pc_${pc.paymentChequeId}_${idx}`,
            documentType: 'اعلامیه پرداخت',
            transactionType: 'چک',
            documentNumber: pc.paymentNotification?.documentNumber || '',
            documentDate: pc.paymentNotification?.documentDate ? new Date(pc.paymentNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: pc.chequeNumber || '',
            itemDate: pc.dueDate ? new Date(pc.dueDate).toISOString().split('T')[0] : '',
            amount: Number(pc.amount || 0),
            paidAmount: Number(pc.amount || 0),
            description: pc.description || '',
            currencyName: pc.paymentNotification?.currency?.title || '',
            
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: pc.paymentNotification?.documentDate ? new Date(pc.paymentNotification.documentDate).getTime() : 0,
          });
        });

        const ppnRepo = this.paymentNotificationRepository.manager.getRepository('PaymentPromissoryNote');
        const ppnQuery = ppnRepo.createQueryBuilder('ppn')
          .innerJoinAndSelect('ppn.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.currency', 'currency')
          .leftJoinAndSelect('ppn.promissoryNoteItem', 'pni')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId })
          .andWhere('pn.partyRef = :partyId', { partyId });
        if (currencyId !== null) ppnQuery.andWhere('pn.currencyRef = :currencyId', { currencyId });
        if (finalFromDate) ppnQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) ppnQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const ppnList = await ppnQuery.getMany();
        ppnList.forEach((ppn: any, idx: number) => {
          reportData.push({
            id: `ppn_${ppn.paymentPromissoryNoteId}_${idx}`,
            documentType: 'اعلامیه پرداخت',
            transactionType: 'سفته',
            documentNumber: ppn.paymentNotification?.documentNumber || '',
            documentDate: ppn.paymentNotification?.documentDate ? new Date(ppn.paymentNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: ppn.promissoryNoteItem?.promissoryNoteNumber || '',
            itemDate: ppn.dueDate ? new Date(ppn.dueDate).toISOString().split('T')[0] : '',
            amount: Number(ppn.amount || 0),
            paidAmount: Number(ppn.amount || 0),
            description: ppn.description || '',
            currencyName: ppn.paymentNotification?.currency?.title || '',
            
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: ppn.paymentNotification?.documentDate ? new Date(ppn.paymentNotification.documentDate).getTime() : 0,
          });
        });

        reportData.sort((a, b) => a.timestamp - b.timestamp);
        return { success: true, reportData };
      }

      // 1. Deposits to this Bank Account from this Counterparty
      const depositQuery = this.receiptDepositRepository
        .createQueryBuilder('deposit')
        .innerJoinAndSelect('deposit.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere('deposit.bankAccountRef = :bankId', { bankId })
        .andWhere('rn.partyRef = :partyId', { partyId });

      if (currencyId !== null) depositQuery.andWhere('rn.currencyRef = :currencyId', { currencyId });
      else depositQuery.andWhere('rn.currencyRef IS NULL');

      if (finalFromDate) depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

      const depositsList = await depositQuery.getMany();
      depositsList.forEach((d, idx) => {
        const v = findVoucher(d.trackingNumber, d.receiptNotification?.documentNumber);
        reportData.push({
          id: `dep_${d.receiptDepositId}_${idx}`,
          receiptNotificationId: d.receiptNotification?.receiptNotificationId,
          documentType: 'رسید دریافت',
          transactionType: 'اعلامیه واریز',
          documentNumber: d.receiptNotification?.documentNumber || '',
          documentDate: d.receiptNotification?.documentDate ? new Date(d.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: d.trackingNumber || '',
          itemDate: d.receiptNotification?.documentDate ? new Date(d.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(d.amount || 0),
          description: d.description || d.receiptNotification?.description || '',
          counterpartyName: d.receiptNotification?.party ? ((d.receiptNotification.party.firstName ? d.receiptNotification.party.firstName + ' ' : '') + (d.receiptNotification.party.lastName || '')).trim() : '',
          currencyName: d.receiptNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: d.receiptNotification?.documentDate ? new Date(d.receiptNotification.documentDate).getTime() : 0,
        });
      });

      // 2. Withdrawals from this Bank Account to this Counterparty
      const withdrawalQuery = this.paymentWithdrawalRepository
        .createQueryBuilder('withdrawal')
        .innerJoinAndSelect('withdrawal.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.party', 'party')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('withdrawal.bankAccountRef = :bankId', { bankId })
        .andWhere('pn.partyRef = :partyId', { partyId });

      if (currencyId !== null) withdrawalQuery.andWhere('pn.currencyRef = :currencyId', { currencyId });
      else withdrawalQuery.andWhere('pn.currencyRef IS NULL');

      if (finalFromDate) withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

      const withdrawalsList = await withdrawalQuery.getMany();
      withdrawalsList.forEach((w, idx) => {
        const v = findVoucher(w.trackingNumber, w.paymentNotification?.documentNumber);
        reportData.push({
          id: `wit_${w.paymentWithdrawalId}_${idx}`,
          paymentNotificationId: w.paymentNotification?.paymentNotificationId,
          documentType: 'اعلامیه پرداخت',
          transactionType: 'اعلامیه برداشت',
          documentNumber: w.paymentNotification?.documentNumber || '',
          documentDate: w.paymentNotification?.documentDate ? new Date(w.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: w.trackingNumber || '',
          itemDate: w.paymentNotification?.documentDate ? new Date(w.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(w.amount || 0),
          description: w.description || w.paymentNotification?.description || '',
          counterpartyName: w.paymentNotification?.party ? ((w.paymentNotification.party.firstName ? w.paymentNotification.party.firstName + ' ' : '') + (w.paymentNotification.party.lastName || '')).trim() : '',
          currencyName: w.paymentNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: w.paymentNotification?.documentDate ? new Date(w.paymentNotification.documentDate).getTime() : 0,
        });
      });

      // 3. Received Cheque Operations in this Bank Account
      const receivedChequeQuery = this.receivedChequeOperationRepository
        .createQueryBuilder('rc')
        .leftJoinAndSelect('rc.items', 'items')
        .leftJoinAndSelect('items.receiptCheque', 'cheque')
        .leftJoinAndSelect('cheque.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .where('rc.companyRef = :compId', { compId })
        .andWhere('rc.businessStructureRef = :bsId', { bsId })
        .andWhere('rc.bankAccountRef = :bankId', { bankId })
        .andWhere('rn.partyRef = :partyId', { partyId });

      if (currencyId !== null) receivedChequeQuery.andWhere('rn.currencyRef = :currencyId', { currencyId });
      else receivedChequeQuery.andWhere('rn.currencyRef IS NULL');

      if (finalFromDate) receivedChequeQuery.andWhere('rc.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) receivedChequeQuery.andWhere('rc.documentDate <= :finalToDate', { finalToDate });

      const receivedChequeList = await receivedChequeQuery.getMany();
      receivedChequeList.forEach((rc, rcIdx) => {
        let opTypeStr = 'عملیات چک دریافتنی';
        if (rc.operationType === 1) opTypeStr = 'واگذاری به بانک';
        else if (rc.operationType === 2) opTypeStr = 'واخواست چک';
        else if (rc.operationType === 3) opTypeStr = 'وصول چک';
        else if (rc.operationType === 4) opTypeStr = 'استرداد چک';

        rc.items?.forEach((item: any, itemIdx) => {
          const v = findVoucher(item.receiptCheque?.chequeNumber, rc.documentNumber);
          
          reportData.push({
            id: `rc_${rc.receivedChequeOperationId}_${rcIdx}_${itemIdx}`,
            receivedChequeOperationId: rc.receivedChequeOperationId,
            documentType: 'عملیات چک دریافتنی',
            transactionType: opTypeStr,
            documentNumber: rc.documentNumber || '',
            documentDate: rc.documentDate ? new Date(rc.documentDate).toISOString().split('T')[0] : '',
            itemNumber: item.receiptCheque?.chequeNumber || '',
            itemDate: item.receiptCheque?.dueDate ? new Date(item.receiptCheque.dueDate).toISOString().split('T')[0] : '',
            amount: Number(item.receiptCheque?.amount || 0),
            description: rc.assignmentNumber ? `شماره واگذاری: ${rc.assignmentNumber}` : '',
            counterpartyName: item.receiptCheque?.receiptNotification?.party ? ((item.receiptCheque.receiptNotification.party.firstName ? item.receiptCheque.receiptNotification.party.firstName + ' ' : '') + (item.receiptCheque.receiptNotification.party.lastName || '')).trim() : '',
            currencyName: '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: rc.documentDate ? new Date(rc.documentDate).getTime() : 0,
          });
        });
      });

      // 4. Paid Cheques Clearing in this Bank Account
      const paidChequeQuery = this.paidDocumentClearingRepository
        .createQueryBuilder('pc')
        .leftJoinAndSelect('pc.items', 'items')
        .leftJoinAndMapOne('items.paymentCheque', PaymentCheque, 'cheque', 'cheque."PaymentChequeID" = items."DocumentId" AND items."DocumentType" = \'cheque\'')
        .leftJoinAndSelect('cheque.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.party', 'party')
        .where('pc.companyRef = :compId', { compId })
        .andWhere('pc.businessStructureRef = :bsId', { bsId })
        .andWhere('pc.bankAccountRef = :bankId', { bankId })
        .andWhere('pn.partyRef = :partyId', { partyId });

      if (currencyId !== null) paidChequeQuery.andWhere('pn.currencyRef = :currencyId', { currencyId });
      else paidChequeQuery.andWhere('pn.currencyRef IS NULL');

      if (finalFromDate) paidChequeQuery.andWhere('pc.date >= :finalFromDate', { finalFromDate });
      if (finalToDate) paidChequeQuery.andWhere('pc.date <= :finalToDate', { finalToDate });

      const paidChequeList = await paidChequeQuery.getMany();
      paidChequeList.forEach((pc, pcIdx) => {
        pc.items?.forEach((item: any, itemIdx) => {
          const v = findVoucher(item.paymentCheque?.chequeNumber, pc.number);
          reportData.push({
            id: `pc_${pc.paidDocumentClearingId}_${pcIdx}_${itemIdx}`,
            paidDocumentClearingId: pc.paidDocumentClearingId,
            documentType: 'عملیات چک پرداختی',
            transactionType: 'پاس شدن چک',
            documentNumber: pc.number || '',
            documentDate: pc.date ? new Date(pc.date).toISOString().split('T')[0] : '',
            itemNumber: item.paymentCheque?.chequeNumber || '',
            itemDate: item.paymentCheque?.dueDate ? new Date(item.paymentCheque.dueDate).toISOString().split('T')[0] : '',
            amount: Number(item.paymentCheque?.amount || 0),
            description: pc.description || '',
            counterpartyName: item.paymentCheque?.paymentNotification?.party ? ((item.paymentCheque.paymentNotification.party.firstName ? item.paymentCheque.paymentNotification.party.firstName + ' ' : '') + (item.paymentCheque.paymentNotification.party.lastName || '')).trim() : '',
            currencyName: '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: pc.date ? new Date(pc.date).getTime() : 0,
          });
        });
      });

      reportData.sort((a, b) => a.timestamp - b.timestamp);

      return {
        success: true,
        reportData
      };
    }

    if (cleanVerticalType === 'bank_account' && cleanHorizontalType === 'petty_cash') {
      const bankId = Number(verticalValue);
      const pettyCashId = Number(selectedId);

      const pettyCash = await this.pettyCashRepository.findOne({ where: { pettyCashId } });
      const partyId = pettyCash?.partyRef;

      if (partyId) {
        // 1. Bank to Petty Cash Payments
        const bankToPettyCashQuery = this.paymentWithdrawalRepository
          .createQueryBuilder('wi')
          .innerJoinAndSelect('wi.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.currency', 'currency')
          .where('pn.paymentType = 2')
          .andWhere('pn.partyRef = :partyId', { partyId })
          .andWhere('wi.bankAccountRef = :bankId', { bankId })
          .andWhere('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId });

        if (finalFromDate) bankToPettyCashQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) bankToPettyCashQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const bankToPettyCashList = await bankToPettyCashQuery.getMany();

        bankToPettyCashList.forEach((wi, idx) => {
          reportData.push({
            id: `btp_pm_${wi.paymentWithdrawalId}_${idx}`,
            paymentNotificationId: wi.paymentNotification?.paymentNotificationId,
            documentType: 'اعلامیه پرداخت',
            transactionType: 'شارژ تنخواه از بانک',
            documentNumber: wi.paymentNotification?.documentNumber || '',
            documentDate: wi.paymentNotification?.documentDate ? new Date(wi.paymentNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: '',
            itemDate: wi.paymentNotification?.documentDate ? new Date(wi.paymentNotification.documentDate).toISOString().split('T')[0] : '',
            amount: Number(wi.amount || 0),
            receivedAmount: Number(wi.amount || 0),
            paidAmount: 0,
            description: wi.description || wi.paymentNotification?.description || '',
            counterpartyName: 'شارژ تنخواه',
            currencyName: wi.paymentNotification?.currency?.title || '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: wi.paymentNotification?.documentDate ? new Date(wi.paymentNotification.documentDate).getTime() : 0,
          });
        });

        // 2. Petty Cash to Bank Receipts
        const pettyCashToBankQuery = this.receiptDepositRepository
          .createQueryBuilder('di')
          .innerJoinAndSelect('di.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.currency', 'currency')
          .where('rn.receiptType = :receiptType', { receiptType: 'تسویه تنخواه' })
          .andWhere('rn.partyRef = :partyId', { partyId })
          .andWhere('di.bankAccountRef = :bankId', { bankId })
          .andWhere('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId });

        if (finalFromDate) pettyCashToBankQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) pettyCashToBankQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

        const pettyCashToBankList = await pettyCashToBankQuery.getMany();

        pettyCashToBankList.forEach((di, idx) => {
          const v = findVoucher(di.trackingNumber, di.receiptNotification?.documentNumber);
          reportData.push({
            id: `ptb_rc_${di.receiptDepositId}_${idx}`,
            receiptNotificationId: di.receiptNotification?.receiptNotificationId,
            documentType: 'رسید دریافت',
            transactionType: 'واریز تنخواه به بانک',
            documentNumber: di.receiptNotification?.documentNumber || '',
            documentDate: di.receiptNotification?.documentDate ? new Date(di.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: di.trackingNumber || '',
            itemDate: di.receiptNotification?.documentDate ? new Date(di.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            amount: Number(di.amount || 0),
            receivedAmount: 0,
            paidAmount: Number(di.amount || 0),
            description: di.description || di.receiptNotification?.description || '',
            counterpartyName: 'واریز به بانک',
            currencyName: di.receiptNotification?.currency?.title || '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: di.receiptNotification?.documentDate ? new Date(di.receiptNotification.documentDate).getTime() : 0,
          });
        });
      }

      reportData.sort((a, b) => a.timestamp - b.timestamp);

      return {
        success: true,
        reportData
      };
    }

    if (cleanVerticalType === 'cash') {
      // Get all deposits from receipt notifications for this cash register
      const depositQuery = this.receiptCashRepository
        .createQueryBuilder('rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('rn.currency', 'currency')
        .leftJoinAndSelect('rc.accountingSetting', 'accountingSetting')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere('rc.cashRef = :cashId', { cashId: cleanHorizontalType === 'accounting_operation' || cleanHorizontalType === 'reason' ? Number(verticalValue) : Number(selectedId) });

      if (cleanHorizontalType === 'accounting_operation') {
        if (selectedId === 'empty') depositQuery.andWhere('rc.accountingSettingRef IS NULL');
        else depositQuery.andWhere('rc.accountingSettingRef = :selectedId', { selectedId: Number(selectedId) });
      } else if (cleanHorizontalType === 'reason') {
        if (selectedId === 'empty') depositQuery.andWhere('rc.reasonRef IS NULL');
        else depositQuery.andWhere('rc.reasonRef = :selectedId', { selectedId: Number(selectedId) });
      }

      if (finalFromDate) {
        depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const depositsList = await depositQuery.getMany();

      depositsList.forEach((d, idx) => {
        reportData.push({
          id: `dep_${d.receiptCashId}_${idx}`,
          receiptNotificationId: d.receiptNotification?.receiptNotificationId,
          documentType: 'رسید دریافت',
          transactionType: 'دریافت نقدی',
          documentNumber: d.receiptNotification?.documentNumber || '',
          documentDate: d.receiptNotification?.documentDate ? new Date(d.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: '',
          itemDate: d.receiptNotification?.documentDate ? new Date(d.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(d.amount || 0),
          description: d.description || d.receiptNotification?.description || '',
          counterpartyName: d.receiptNotification?.party ? ((d.receiptNotification.party.firstName ? d.receiptNotification.party.firstName + ' ' : '') + (d.receiptNotification.party.lastName || '')).trim() : '',
          currencyName: d.receiptNotification?.currency?.title || '',
          operationCode: d.accountingSetting?.code || '',
          operationTitle: d.accountingSetting?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: d.receiptNotification?.documentDate ? new Date(d.receiptNotification.documentDate).getTime() : 0,
        });
      });

      // Get all withdrawals from payment notifications for this cash register
      const withdrawalQuery = this.paymentCashRepository
        .createQueryBuilder('pc')
        .innerJoinAndSelect('pc.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.party', 'party')
        .leftJoinAndSelect('pn.currency', 'currency')
        .leftJoinAndSelect('pc.accountingSetting', 'accountingSetting')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('pc.cashRef = :cashId', { cashId: cleanHorizontalType === 'accounting_operation' || cleanHorizontalType === 'reason' ? Number(verticalValue) : Number(selectedId) });

      if (cleanHorizontalType === 'accounting_operation') {
        if (selectedId === 'empty') withdrawalQuery.andWhere('pc.accountingSettingRef IS NULL');
        else withdrawalQuery.andWhere('pc.accountingSettingRef = :selectedId', { selectedId: Number(selectedId) });
      } else if (cleanHorizontalType === 'reason') {
        if (selectedId === 'empty') withdrawalQuery.andWhere('pc.reasonRef IS NULL');
        else withdrawalQuery.andWhere('pc.reasonRef = :selectedId', { selectedId: Number(selectedId) });
      }

      if (finalFromDate) {
        withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const withdrawalsList = await withdrawalQuery.getMany();

      withdrawalsList.forEach((w, idx) => {
        reportData.push({
          id: `wit_${w.paymentCashId}_${idx}`,
          paymentNotificationId: w.paymentNotification?.paymentNotificationId,
          documentType: 'اعلامیه پرداخت',
          transactionType: 'پرداخت نقدی',
          documentNumber: w.paymentNotification?.documentNumber || '',
          documentDate: w.paymentNotification?.documentDate ? new Date(w.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: '',
          itemDate: w.paymentNotification?.documentDate ? new Date(w.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(w.amount || 0),
          description: w.description || w.paymentNotification?.description || '',
          counterpartyName: w.paymentNotification?.party ? ((w.paymentNotification.party.firstName ? w.paymentNotification.party.firstName + ' ' : '') + (w.paymentNotification.party.lastName || '')).trim() : '',
          currencyName: w.paymentNotification?.currency?.title || '',
          operationCode: w.accountingSetting?.code || '',
          operationTitle: w.accountingSetting?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: w.paymentNotification?.documentDate ? new Date(w.paymentNotification.documentDate).getTime() : 0,
        });
      });
    } else if (cleanVerticalType === 'receipt_promissory_note' || cleanVerticalType === 'detailedType_2') {
      let cashId: number | null = null;
      let filterType: 'cheque' | 'promissory' | 'all' = 'all';

      // Parse from selectedId
      if (selectedId === 'cheque') {
        filterType = 'cheque';
      } else if (selectedId === 'promissory') {
        filterType = 'promissory';
      } else if (selectedId && selectedId.startsWith('cheque_')) {
        filterType = 'cheque';
        cashId = Number(selectedId.split('_')[1]);
      } else if (selectedId && selectedId.startsWith('promissory_')) {
        filterType = 'promissory';
        cashId = Number(selectedId.split('_')[1]);
      } else if (selectedId && !isNaN(Number(selectedId))) {
        cashId = Number(selectedId);
      }

      if (cashId !== null && isNaN(cashId)) {
        cashId = null;
      }

      // Parse/Override from verticalValue if needed
      if (verticalValue) {
        if (verticalValue === 'cheque') {
          filterType = 'cheque';
        } else if (verticalValue === 'promissory') {
          filterType = 'promissory';
        } else if (verticalValue.startsWith('cheque_')) {
          filterType = 'cheque';
          if (cashId === null || isNaN(cashId)) {
            cashId = Number(verticalValue.split('_')[1]);
          }
        } else if (verticalValue.startsWith('promissory_')) {
          filterType = 'promissory';
          if (cashId === null || isNaN(cashId)) {
            cashId = Number(verticalValue.split('_')[1]);
          }
        } else if (!isNaN(Number(verticalValue))) {
          if (cashId === null || isNaN(cashId)) {
            cashId = Number(verticalValue);
          }
        }
      }

      if (cashId !== null && isNaN(cashId)) {
        cashId = null;
      }

      // Helper function to optionally add cashRef condition
      const applyCashFilter = (queryBuilder: any, alias: string) => {
        if (cashId !== null) {
          queryBuilder.andWhere(`${alias}.cashRef = :cashId`, { cashId });
        }
      };

      // Query 1: ReceiptCheque (رسید دریافت - چک)
      if (filterType === 'cheque' || filterType === 'all') {
        const rcQuery = this.receiptChequeRepository
        .createQueryBuilder('rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });
        applyCashFilter(rcQuery, 'rc');

      if (finalFromDate) {
        rcQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        rcQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const rcList = await rcQuery.getMany();

      rcList.forEach((rc, idx) => {
        const v = findVoucher(rc.chequeNumber, rc.receiptNotification?.documentNumber);
        reportData.push({
          id: `rc_history_${rc.receiptChequeId}_${idx}`,
          receiptNotificationId: rc.receiptNotification?.receiptNotificationId,
          documentType: 'رسید دریافت',
          transactionType: 'چک',
          documentNumber: rc.receiptNotification?.documentNumber || '',
          documentDate: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: rc.chequeNumber || '',
          itemDate: rc.dueDate ? new Date(rc.dueDate).toISOString().split('T')[0] : '',
          amount: Number(rc.amount || 0),
          receivedAmount: Number(rc.amount || 0),
          paidAmount: 0,
          description: rc.description || rc.receiptNotification?.description || '',
          counterpartyName: rc.receiptNotification?.party ? ((rc.receiptNotification.party.firstName ? rc.receiptNotification.party.firstName + ' ' : '') + (rc.receiptNotification.party.lastName || '')).trim() : '',
          currencyName: rc.receiptNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).getTime() : 0,
        });
      });

      // Query 2: ReceivedChequeOperationItem (عملیات چک دریافتنی - واگذار به بانک)
      const opQuery = this.receivedChequeOperationRepository
        .createQueryBuilder('op')
        .innerJoinAndSelect('op.items', 'items')
        .innerJoinAndSelect('items.receiptCheque', 'rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('op.companyRef = :compId', { compId })
        .andWhere('op.businessStructureRef = :bsId', { bsId })
        .andWhere('op.operationType = 1'); // واگذار به بانک
      applyCashFilter(opQuery, 'rc');

      if (finalFromDate) {
        opQuery.andWhere('op.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        opQuery.andWhere('op.documentDate <= :finalToDate', { finalToDate });
      }

      const opList = await opQuery.getMany();

      opList.forEach((op, opIdx) => {
        op.items?.forEach((item, itemIdx) => {
          const rc = item.receiptCheque;
          if (!rc) return;
          const v = findVoucher(rc.chequeNumber, op.documentNumber);
          reportData.push({
            id: `op_history_${op.receivedChequeOperationId}_${opIdx}_${itemIdx}`,
            receivedChequeOperationId: op.receivedChequeOperationId,
            documentType: 'عملیات چک دریافتنی',
            transactionType: 'واگذار به بانک',
            documentNumber: op.documentNumber || '',
            documentDate: op.documentDate ? new Date(op.documentDate).toISOString().split('T')[0] : '',
            itemNumber: rc.chequeNumber || '',
            itemDate: rc.dueDate ? new Date(rc.dueDate).toISOString().split('T')[0] : '',
            amount: Number(rc.amount || 0),
            receivedAmount: 0,
            paidAmount: Number(rc.amount || 0),
            description: op.assignmentNumber ? `شماره واگذاری: ${op.assignmentNumber}` : (rc.description || rc.receiptNotification?.description || ''),
            counterpartyName: rc.receiptNotification?.party ? ((rc.receiptNotification.party.firstName ? rc.receiptNotification.party.firstName + ' ' : '') + (rc.receiptNotification.party.lastName || '')).trim() : '',
            currencyName: rc.receiptNotification?.currency?.title || '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: op.documentDate ? new Date(op.documentDate).getTime() : 0,
          });
        });
      });

      // Query 3: PaymentAssignment (اعلامیه پرداخت - واگذار به غیر)
      const paQuery = this.paymentAssignmentRepository
        .createQueryBuilder('pa')
        .innerJoinAndSelect('pa.receiptCheque', 'rc')
        .innerJoinAndSelect('pa.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.party', 'party')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });
      applyCashFilter(paQuery, 'rc');

      if (finalFromDate) {
        paQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        paQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const paList = await paQuery.getMany();

      paList.forEach((pa, idx) => {
        const rc = pa.receiptCheque;
        if (!rc) return;
        const v = findVoucher(rc.chequeNumber, pa.paymentNotification?.documentNumber);
        reportData.push({
          id: `pa_history_${pa.paymentAssignmentId}_${idx}`,
          paymentNotificationId: pa.paymentNotification?.paymentNotificationId,
          documentType: 'اعلامیه پرداخت',
          transactionType: 'واگذار به غیر',
          documentNumber: pa.paymentNotification?.documentNumber || '',
          documentDate: pa.paymentNotification?.documentDate ? new Date(pa.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: rc.chequeNumber || '',
          itemDate: rc.dueDate ? new Date(rc.dueDate).toISOString().split('T')[0] : '',
          amount: Number(pa.amount || 0),
          receivedAmount: 0,
          paidAmount: Number(pa.amount || 0),
          description: pa.description || pa.paymentNotification?.description || '',
          counterpartyName: pa.paymentNotification?.party ? ((pa.paymentNotification.party.firstName ? pa.paymentNotification.party.firstName + ' ' : '') + (pa.paymentNotification.party.lastName || '')).trim() : '',
          currencyName: pa.paymentNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: pa.paymentNotification?.documentDate ? new Date(pa.paymentNotification.documentDate).getTime() : 0,
        });
      });

      // Query 4: ReceiptReturnedPaymentAssignment (رسید دریافت - برگشت از واگذار به غیر)
      const rrQuery = this.receiptReturnedPaymentAssignmentRepository
        .createQueryBuilder('rr')
        .innerJoinAndSelect('rr.paymentAssignment', 'pa')
        .innerJoinAndSelect('pa.receiptCheque', 'rc')
        .innerJoinAndSelect('rr.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });
      applyCashFilter(rrQuery, 'rc');

      if (finalFromDate) {
        rrQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        rrQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const rrList = await rrQuery.getMany();

      rrList.forEach((rr, idx) => {
        const pa = rr.paymentAssignment;
        const rc = pa?.receiptCheque;
        if (!rc) return;
        const v = findVoucher(rc.chequeNumber, rr.receiptNotification?.documentNumber);
        reportData.push({
          id: `rr_history_${rr.receiptReturnedPaymentAssignmentId}_${idx}`,
          receiptNotificationId: rr.receiptNotification?.receiptNotificationId,
          documentType: 'رسید دریافت',
          transactionType: 'برگشت از واگذار به غیر',
          documentNumber: rr.receiptNotification?.documentNumber || '',
          documentDate: rr.receiptNotification?.documentDate ? new Date(rr.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: rc.chequeNumber || '',
          itemDate: rc.dueDate ? new Date(rc.dueDate).toISOString().split('T')[0] : '',
          amount: Number(rr.amount || 0),
          receivedAmount: Number(rr.amount || 0),
          paidAmount: 0,
          description: rr.description || rr.receiptNotification?.description || '',
          counterpartyName: rr.receiptNotification?.party ? ((rr.receiptNotification.party.firstName ? rr.receiptNotification.party.firstName + ' ' : '') + (rr.receiptNotification.party.lastName || '')).trim() : '',
          currencyName: rr.receiptNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: rr.receiptNotification?.documentDate ? new Date(rr.receiptNotification.documentDate).getTime() : 0,
        });
      });

      }

      // Query 5: ReceiptPromissoryNote (رسید دریافت - سفته)
      if (filterType === 'promissory' || filterType === 'all') {
        const rpQuery = this.receiptPromissoryNoteRepository
        .createQueryBuilder('rp')
        .innerJoinAndSelect('rp.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });
        applyCashFilter(rpQuery, 'rp');

      if (finalFromDate) {
        rpQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        rpQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const rpList = await rpQuery.getMany();

      rpList.forEach((rp, idx) => {
        const v = findVoucher(rp.promissoryNoteNumber, rp.receiptNotification?.documentNumber);
        reportData.push({
          id: `rp_history_${rp.receiptPromissoryNoteId}_${idx}`,
          receiptNotificationId: rp.receiptNotification?.receiptNotificationId,
          documentType: 'رسید دریافت',
          transactionType: 'سفته',
          documentNumber: rp.receiptNotification?.documentNumber || '',
          documentDate: rp.receiptNotification?.documentDate ? new Date(rp.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: rp.promissoryNoteNumber || '',
          itemDate: rp.receiptNotification?.documentDate ? new Date(rp.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(rp.amount || 0),
          receivedAmount: Number(rp.amount || 0),
          paidAmount: 0,
          description: rp.description || rp.receiptNotification?.description || '',
          counterpartyName: rp.receiptNotification?.party ? ((rp.receiptNotification.party.firstName ? rp.receiptNotification.party.firstName + ' ' : '') + (rp.receiptNotification.party.lastName || '')).trim() : '',
          currencyName: rp.receiptNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: rp.receiptNotification?.documentDate ? new Date(rp.receiptNotification.documentDate).getTime() : 0,
        });
      });

      // Query 6: PaymentReturnedReceivedPromissoryNote (اعلامیه پرداخت - برگشت سفته دریافتنی)
      const prrQuery = this.paymentReturnedReceivedPromissoryNoteRepository
        .createQueryBuilder('prr')
        .innerJoinAndSelect('prr.paymentNotification', 'pn')
        .innerJoinAndSelect('prr.receiptPromissoryNote', 'rp')
        .innerJoinAndSelect('rp.receiptNotification', 'rn')
        .leftJoinAndSelect('pn.party', 'party')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });
        applyCashFilter(prrQuery, 'rp');

      if (finalFromDate) {
        prrQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        prrQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const prrList = await prrQuery.getMany();

      prrList.forEach((prr, idx) => {
        const rp = prr.receiptPromissoryNote;
        if (!rp) return;
        const v = findVoucher(rp.promissoryNoteNumber, prr.paymentNotification?.documentNumber);
        reportData.push({
          id: `prr_history_${prr.paymentReturnedReceivedPromissoryNoteId}_${idx}`,
          paymentNotificationId: prr.paymentNotification?.paymentNotificationId,
          documentType: 'اعلامیه پرداخت',
          transactionType: 'برگشت سفته دریافتنی',
          documentNumber: prr.paymentNotification?.documentNumber || '',
          documentDate: prr.paymentNotification?.documentDate ? new Date(prr.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: rp.promissoryNoteNumber || '',
          itemDate: prr.paymentNotification?.documentDate ? new Date(prr.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(prr.amount || 0),
          receivedAmount: 0,
          paidAmount: Number(prr.amount || 0),
          description: prr.description || prr.paymentNotification?.description || '',
          counterpartyName: prr.paymentNotification?.party ? ((prr.paymentNotification.party.firstName ? prr.paymentNotification.party.firstName + ' ' : '') + (prr.paymentNotification.party.lastName || '')).trim() : '',
          currencyName: prr.paymentNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: prr.paymentNotification?.documentDate ? new Date(prr.paymentNotification.documentDate).getTime() : 0,
        });
      });
      }
    } else if (cleanVerticalType === 'bank_account' || cleanVerticalType === 'detailedType_1') {
      // Get all deposits from receipt notifications for this bank account
      const depositQuery = this.receiptDepositRepository
        .createQueryBuilder('deposit')
        .innerJoinAndSelect('deposit.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere('deposit.bankAccountRef = :bankAccountId', { bankAccountId: Number(selectedId) });

      if (finalFromDate) {
        depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const depositsList = await depositQuery.getMany();

      depositsList.forEach((d, idx) => {
        const v = findVoucher(d.trackingNumber, d.receiptNotification?.documentNumber);
        reportData.push({
          id: `dep_${d.receiptDepositId}_${idx}`,
          receiptNotificationId: d.receiptNotification?.receiptNotificationId,
          documentType: 'رسید دریافت',
          transactionType: 'اعلامیه واریز',
          documentNumber: d.receiptNotification?.documentNumber || '',
          documentDate: d.receiptNotification?.documentDate ? new Date(d.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: d.trackingNumber || '',
          itemDate: d.receiptNotification?.documentDate ? new Date(d.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(d.amount || 0),
          description: d.description || d.receiptNotification?.description || '',
          counterpartyName: d.receiptNotification?.party ? ((d.receiptNotification.party.firstName ? d.receiptNotification.party.firstName + ' ' : '') + (d.receiptNotification.party.lastName || '')).trim() : '',
          currencyName: d.receiptNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: d.receiptNotification?.documentDate ? new Date(d.receiptNotification.documentDate).getTime() : 0,
        });
      });

      // Get all withdrawals from payment notifications for this bank account
      const withdrawalQuery = this.paymentWithdrawalRepository
        .createQueryBuilder('withdrawal')
        .innerJoinAndSelect('withdrawal.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.party', 'party')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('withdrawal.bankAccountRef = :bankAccountId', { bankAccountId: Number(selectedId) });

      if (finalFromDate) {
        withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const withdrawalsList = await withdrawalQuery.getMany();

      withdrawalsList.forEach((w, idx) => {
        const v = findVoucher(w.trackingNumber, w.paymentNotification?.documentNumber);
        reportData.push({
          id: `wit_${w.paymentWithdrawalId}_${idx}`,
          paymentNotificationId: w.paymentNotification?.paymentNotificationId,
          documentType: 'اعلامیه پرداخت',
          transactionType: 'اعلامیه برداشت',
          documentNumber: w.paymentNotification?.documentNumber || '',
          documentDate: w.paymentNotification?.documentDate ? new Date(w.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: w.trackingNumber || '',
          itemDate: w.paymentNotification?.documentDate ? new Date(w.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          amount: Number(w.amount || 0),
          description: w.description || w.paymentNotification?.description || '',
          counterpartyName: w.paymentNotification?.party ? ((w.paymentNotification.party.firstName ? w.paymentNotification.party.firstName + ' ' : '') + (w.paymentNotification.party.lastName || '')).trim() : '',
          currencyName: w.paymentNotification?.currency?.title || '',
          voucherId: '',
          voucherNumber: '',
          dailyNumber: '',
          voucherDate: '',
          timestamp: w.paymentNotification?.documentDate ? new Date(w.paymentNotification.documentDate).getTime() : 0,
        });
      });

      // Get all operations from received cheques for this bank account
      const receivedChequeQuery = this.receivedChequeOperationRepository
        .createQueryBuilder('rc')
        .leftJoinAndSelect('rc.items', 'items')
        .leftJoinAndSelect('items.receiptCheque', 'cheque')
        .leftJoinAndSelect('cheque.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .where('rc.companyRef = :compId', { compId })
        .andWhere('rc.businessStructureRef = :bsId', { bsId })
        .andWhere('rc.bankAccountRef = :bankAccountId', { bankAccountId: Number(selectedId) });

      if (finalFromDate) {
        receivedChequeQuery.andWhere('rc.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        receivedChequeQuery.andWhere('rc.documentDate <= :finalToDate', { finalToDate });
      }

      const receivedChequeList = await receivedChequeQuery.getMany();

      receivedChequeList.forEach((rc, rcIdx) => {
        let opTypeStr = 'عملیات چک دریافتنی';
        if (rc.operationType === 1) opTypeStr = 'واگذاری به بانک';
        else if (rc.operationType === 2) opTypeStr = 'واخواست چک';
        else if (rc.operationType === 3) opTypeStr = 'وصول چک';
        else if (rc.operationType === 4) opTypeStr = 'استرداد چک';

        rc.items?.forEach((item: any, itemIdx) => {
          const v = findVoucher(item.receiptCheque?.chequeNumber, rc.documentNumber);
          reportData.push({
            id: `rc_${rc.receivedChequeOperationId}_${rcIdx}_${itemIdx}`,
            receivedChequeOperationId: rc.receivedChequeOperationId,
            documentType: 'عملیات چک دریافتنی',
            transactionType: opTypeStr,
            documentNumber: rc.documentNumber || '',
            documentDate: rc.documentDate ? new Date(rc.documentDate).toISOString().split('T')[0] : '',
            itemNumber: item.receiptCheque?.chequeNumber || '',
            itemDate: item.receiptCheque?.dueDate ? new Date(item.receiptCheque.dueDate).toISOString().split('T')[0] : '',
            amount: Number(item.receiptCheque?.amount || 0),
            description: rc.assignmentNumber ? `شماره واگذاری: ${rc.assignmentNumber}` : '',
            counterpartyName: item.receiptCheque?.receiptNotification?.party ? ((item.receiptCheque.receiptNotification.party.firstName ? item.receiptCheque.receiptNotification.party.firstName + ' ' : '') + (item.receiptCheque.receiptNotification.party.lastName || '')).trim() : '',
            currencyName: '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: rc.documentDate ? new Date(rc.documentDate).getTime() : 0,
          });
        });
      });

      // Get all operations from paid cheques clearing for this bank account
      const paidChequeQuery = this.paidDocumentClearingRepository
        .createQueryBuilder('pc')
        .leftJoinAndSelect('pc.items', 'items')
        .leftJoinAndMapOne('items.paymentCheque', PaymentCheque, 'cheque', 'cheque."PaymentChequeID" = items."DocumentId" AND items."DocumentType" = \'cheque\'')
        .leftJoinAndSelect('cheque.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.party', 'party')
        .where('pc.companyRef = :compId', { compId })
        .andWhere('pc.businessStructureRef = :bsId', { bsId })
        .andWhere('pc.bankAccountRef = :bankAccountId', { bankAccountId: Number(selectedId) });

      if (finalFromDate) {
        paidChequeQuery.andWhere('pc.date >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        paidChequeQuery.andWhere('pc.date <= :finalToDate', { finalToDate });
      }

      const paidChequeList = await paidChequeQuery.getMany();

      paidChequeList.forEach((pc, pcIdx) => {
        pc.items?.forEach((item: any, itemIdx) => {
          const v = findVoucher(item.paymentCheque?.chequeNumber, pc.number);
          reportData.push({
            id: `pc_${pc.paidDocumentClearingId}_${pcIdx}_${itemIdx}`,
            paidDocumentClearingId: pc.paidDocumentClearingId,
            documentType: 'عملیات چک پرداختی',
            transactionType: 'پاس شدن چک',
            documentNumber: pc.number || '',
            documentDate: pc.date ? new Date(pc.date).toISOString().split('T')[0] : '',
            itemNumber: item.paymentCheque?.chequeNumber || '',
            itemDate: item.paymentCheque?.dueDate ? new Date(item.paymentCheque.dueDate).toISOString().split('T')[0] : '',
            amount: Number(item.paymentCheque?.amount || 0),
            description: pc.description || '',
            counterpartyName: item.paymentCheque?.paymentNotification?.party ? ((item.paymentCheque.paymentNotification.party.firstName ? item.paymentCheque.paymentNotification.party.firstName + ' ' : '') + (item.paymentCheque.paymentNotification.party.lastName || '')).trim() : '',
            currencyName: '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: pc.date ? new Date(pc.date).getTime() : 0,
          });
        });
      });
    } else if (cleanVerticalType === 'payment_promissory_note') {
      let currId: number | null = null;
      let filterType: 'cheque' | 'promissory' | 'all' = 'all';

      if (selectedId === 'cheque') {
        filterType = 'cheque';
      } else if (selectedId === 'promissory') {
        filterType = 'promissory';
      } else if (selectedId && selectedId.startsWith('cheque_')) {
        filterType = 'cheque';
        currId = Number(selectedId.split('_')[1]);
      } else if (selectedId && selectedId.startsWith('promissory_')) {
        filterType = 'promissory';
        currId = Number(selectedId.split('_')[1]);
      }

      const { ReceiptReturnedPaidCheque } = await import('../../domain/entities/receipt-returned-paid-cheque.entity');
      const { ReceiptReturnedPaymentPromissoryNote } = await import('../../domain/entities/receipt-returned-payment-promissory-note.entity');
      const { PaymentPromissoryNote } = await import('../../domain/entities/payment-promissory-note.entity');
      const { PaymentCheque } = await import('../../domain/entities/payment-cheque.entity');

      const rcRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaidCheque);
      const rpRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaymentPromissoryNote);
      const ppnRepo = this.cashRepository.manager.getRepository(PaymentPromissoryNote);

      if (filterType === 'cheque' || filterType === 'all') {
        const pcQuery = this.paymentChequeRepository
          .createQueryBuilder('pc')
          .innerJoinAndSelect('pc.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.party', 'party')
          .leftJoinAndSelect('pn.currency', 'currency')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
          if (currId === 0) pcQuery.andWhere('pn.currencyRef IS NULL');
          else pcQuery.andWhere('pn.currencyRef = :currId', { currId });
        }
        if (finalFromDate) pcQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) pcQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const pcList = await pcQuery.getMany();

        pcList.forEach((pc, idx) => {
          const v = findVoucher(pc.chequeNumber, pc.paymentNotification?.documentNumber);
          reportData.push({
            id: `pc_${pc.paymentChequeId}_${idx}`,
            paymentNotificationId: pc.paymentNotification?.paymentNotificationId,
            documentType: 'اعلامیه پرداخت',
            transactionType: 'صدور چک',
            documentNumber: pc.paymentNotification?.documentNumber || '',
            documentDate: pc.paymentNotification?.documentDate ? new Date(pc.paymentNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: pc.chequeNumber || '',
            itemDate: pc.dueDate ? new Date(pc.dueDate).toISOString().split('T')[0] : '',
            amount: Number(pc.amount || 0),
            receivedAmount: Number(pc.amount || 0),
            paidAmount: 0,
            description: pc.description || pc.paymentNotification?.description || '',
            counterpartyName: pc.paymentNotification?.party ? ((pc.paymentNotification.party.firstName ? pc.paymentNotification.party.firstName + ' ' : '') + (pc.paymentNotification.party.lastName || '')).trim() : '',
            currencyName: pc.paymentNotification?.currency?.title || '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: pc.paymentNotification?.documentDate ? new Date(pc.paymentNotification.documentDate).getTime() : 0,
          });
        });

        const clearedChequeQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
          .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
          .innerJoinAndMapOne('item.paymentCheque', PaymentCheque, 'cheque', 'cheque."PaymentChequeID" = item."DocumentId" AND item."DocumentType" = \'cheque\'')
          .leftJoinAndSelect('cheque.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.party', 'party')
          .leftJoinAndSelect('pn.currency', 'currency')
          .where('pdc.companyRef = :compId', { compId })
          .andWhere('pdc.businessStructureRef = :bsId', { bsId })
          .andWhere('item.documentType = :docType', { docType: 'cheque' });

        if (currId !== null) {
          if (currId === 0) clearedChequeQuery.andWhere('pn.currencyRef IS NULL');
          else clearedChequeQuery.andWhere('pn.currencyRef = :currId', { currId });
        }
        if (finalFromDate) clearedChequeQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
        if (finalToDate) clearedChequeQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });

        const clearedCheques = await clearedChequeQuery.getMany();
        clearedCheques.forEach((cItem: any, idx) => {
          const pc = cItem.paymentCheque;
          if (!pc) return;
          const v = findVoucher(pc.chequeNumber, cItem.paidDocumentClearing?.number);
          reportData.push({
            id: `cc_${cItem.paidDocumentClearingItemId}_${idx}`,
            paidDocumentClearingId: cItem.paidDocumentClearing?.paidDocumentClearingId,
            documentType: 'عملیات چک پرداختی',
            transactionType: 'پاس شدن چک',
            documentNumber: cItem.paidDocumentClearing?.number || '',
            documentDate: cItem.paidDocumentClearing?.date ? new Date(cItem.paidDocumentClearing.date).toISOString().split('T')[0] : '',
            itemNumber: pc.chequeNumber || '',
            itemDate: pc.dueDate ? new Date(pc.dueDate).toISOString().split('T')[0] : '',
            amount: Number(pc.amount || 0),
            receivedAmount: 0,
            paidAmount: Number(pc.amount || 0),
            description: cItem.paidDocumentClearing?.description || '',
            counterpartyName: pc.paymentNotification?.party ? ((pc.paymentNotification.party.firstName ? pc.paymentNotification.party.firstName + ' ' : '') + (pc.paymentNotification.party.lastName || '')).trim() : '',
            currencyName: pc.paymentNotification?.currency?.title || '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: cItem.paidDocumentClearing?.date ? new Date(cItem.paidDocumentClearing.date).getTime() : 0,
          });
        });

        const returnedChequesQuery = rcRepo.createQueryBuilder('rc')
          .innerJoinAndSelect('rc.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.party', 'party')
          .leftJoinAndSelect('rn.currency', 'currency')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId });
          
        if (currId !== null) {
          if (currId === 0) returnedChequesQuery.andWhere('rn.currencyRef IS NULL');
          else returnedChequesQuery.andWhere('rn.currencyRef = :currId', { currId });
        }
        if (finalFromDate) returnedChequesQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) returnedChequesQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

        const returnedCheques = await returnedChequesQuery.getMany();
        returnedCheques.forEach((rc: any, idx: number) => {
          reportData.push({
            id: `rc_${rc.receiptReturnedPaidChequeId}_${idx}`,
            receiptNotificationId: rc.receiptNotification?.receiptNotificationId,
            documentType: 'رسید دریافت',
            transactionType: 'عودت چک پرداختی',
            documentNumber: rc.receiptNotification?.documentNumber || '',
            documentDate: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: '',
            itemDate: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            amount: Number(rc.amount || 0),
            receivedAmount: 0,
            paidAmount: Number(rc.amount || 0),
            description: rc.description || rc.receiptNotification?.description || '',
            counterpartyName: rc.receiptNotification?.party ? ((rc.receiptNotification.party.firstName ? rc.receiptNotification.party.firstName + ' ' : '') + (rc.receiptNotification.party.lastName || '')).trim() : '',
            currencyName: rc.receiptNotification?.currency?.title || '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).getTime() : 0,
          });
        });
      }

      if (filterType === 'promissory' || filterType === 'all') {
        const ppnQuery = ppnRepo.createQueryBuilder('ppn')
          .innerJoinAndSelect('ppn.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.party', 'party')
          .leftJoinAndSelect('pn.currency', 'currency')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
          if (currId === 0) ppnQuery.andWhere('pn.currencyRef IS NULL');
          else ppnQuery.andWhere('pn.currencyRef = :currId', { currId });
        }
        if (finalFromDate) ppnQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) ppnQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const ppnList = await ppnQuery.getMany();

        ppnList.forEach((ppn: any, idx: number) => {
          const v = findVoucher(ppn.promissoryNoteNumber, ppn.paymentNotification?.documentNumber);
          reportData.push({
            id: `ppn_${ppn.paymentPromissoryNoteId}_${idx}`,
            paymentNotificationId: ppn.paymentNotification?.paymentNotificationId,
            documentType: 'اعلامیه پرداخت',
            transactionType: 'صدور سفته',
            documentNumber: ppn.paymentNotification?.documentNumber || '',
            documentDate: ppn.paymentNotification?.documentDate ? new Date(ppn.paymentNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: ppn.promissoryNoteNumber || '',
            itemDate: ppn.dueDate ? new Date(ppn.dueDate).toISOString().split('T')[0] : '',
            amount: Number(ppn.amount || 0),
            receivedAmount: Number(ppn.amount || 0),
            paidAmount: 0,
            description: ppn.description || ppn.paymentNotification?.description || '',
            counterpartyName: ppn.paymentNotification?.party ? ((ppn.paymentNotification.party.firstName ? ppn.paymentNotification.party.firstName + ' ' : '') + (ppn.paymentNotification.party.lastName || '')).trim() : '',
            currencyName: ppn.paymentNotification?.currency?.title || '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: ppn.paymentNotification?.documentDate ? new Date(ppn.paymentNotification.documentDate).getTime() : 0,
          });
        });

        const clearedPromissoryQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
          .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
          .innerJoinAndMapOne('item.paymentPromissoryNote', PaymentPromissoryNote, 'promissory', 'promissory."PaymentPromissoryNoteID" = item."DocumentId" AND item."DocumentType" = \'promissory_note\'')
          .leftJoinAndSelect('promissory.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.party', 'party')
          .leftJoinAndSelect('pn.currency', 'currency')
          .where('pdc.companyRef = :compId', { compId })
          .andWhere('pdc.businessStructureRef = :bsId', { bsId })
          .andWhere('item.documentType = :docType', { docType: 'promissory_note' });

        if (currId !== null) {
          if (currId === 0) clearedPromissoryQuery.andWhere('pn.currencyRef IS NULL');
          else clearedPromissoryQuery.andWhere('pn.currencyRef = :currId', { currId });
        }
        if (finalFromDate) clearedPromissoryQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
        if (finalToDate) clearedPromissoryQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });

        const clearedPromissory = await clearedPromissoryQuery.getMany();
        clearedPromissory.forEach((cItem: any, idx: number) => {
          const ppn = cItem.paymentPromissoryNote;
          if (!ppn) return;
          const v = findVoucher(ppn.promissoryNoteNumber, cItem.paidDocumentClearing?.number);
          reportData.push({
            id: `cp_${cItem.paidDocumentClearingItemId}_${idx}`,
            paidDocumentClearingId: cItem.paidDocumentClearing?.paidDocumentClearingId,
            documentType: 'عملیات سفته پرداختی',
            transactionType: 'پاس شدن سفته',
            documentNumber: cItem.paidDocumentClearing?.number || '',
            documentDate: cItem.paidDocumentClearing?.date ? new Date(cItem.paidDocumentClearing.date).toISOString().split('T')[0] : '',
            itemNumber: ppn.promissoryNoteNumber || '',
            itemDate: ppn.dueDate ? new Date(ppn.dueDate).toISOString().split('T')[0] : '',
            amount: Number(ppn.amount || 0),
            receivedAmount: 0,
            paidAmount: Number(ppn.amount || 0),
            description: cItem.paidDocumentClearing?.description || '',
            counterpartyName: ppn.paymentNotification?.party ? ((ppn.paymentNotification.party.firstName ? ppn.paymentNotification.party.firstName + ' ' : '') + (ppn.paymentNotification.party.lastName || '')).trim() : '',
            currencyName: ppn.paymentNotification?.currency?.title || '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: cItem.paidDocumentClearing?.date ? new Date(cItem.paidDocumentClearing.date).getTime() : 0,
          });
        });

        const returnedPromissoryQuery = rpRepo.createQueryBuilder('rp')
          .innerJoinAndSelect('rp.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.party', 'party')
          .leftJoinAndSelect('rn.currency', 'currency')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
          if (currId === 0) returnedPromissoryQuery.andWhere('rn.currencyRef IS NULL');
          else returnedPromissoryQuery.andWhere('rn.currencyRef = :currId', { currId });
        }
        if (finalFromDate) returnedPromissoryQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) returnedPromissoryQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

        const returnedPromissory = await returnedPromissoryQuery.getMany();
        returnedPromissory.forEach((rp: any, idx: number) => {
          reportData.push({
            id: `rp_${rp.receiptReturnedPaymentPromissoryNoteId}_${idx}`,
            receiptNotificationId: rp.receiptNotification?.receiptNotificationId,
            documentType: 'رسید دریافت',
            transactionType: 'عودت سفته پرداختی',
            documentNumber: rp.receiptNotification?.documentNumber || '',
            documentDate: rp.receiptNotification?.documentDate ? new Date(rp.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: '',
            itemDate: rp.receiptNotification?.documentDate ? new Date(rp.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            amount: Number(rp.amount || 0),
            receivedAmount: 0,
            paidAmount: Number(rp.amount || 0),
            description: rp.description || rp.receiptNotification?.description || '',
            counterpartyName: rp.receiptNotification?.party ? ((rp.receiptNotification.party.firstName ? rp.receiptNotification.party.firstName + ' ' : '') + (rp.receiptNotification.party.lastName || '')).trim() : '',
            currencyName: rp.receiptNotification?.currency?.title || '',
            voucherId: '',
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: rp.receiptNotification?.documentDate ? new Date(rp.receiptNotification.documentDate).getTime() : 0,
          });
        });
      }
    }

    if (cleanVerticalType === 'counterparty' && cleanHorizontalType === 'counterparty') {
      const parts = String(selectedId).split('_');
      const partyId = Number(parts[0]);
      const currencyId = parts.length > 1 && parts[1] !== 'null' && parts[1] !== 'undefined' ? Number(parts[1]) : null;

      if (cellFilter === 'receipt_cheques' || cellFilter === 'inCollection' || cellFilter === 'collected' || cellFilter === 'protested') {
        const rcQuery = this.receiptChequeRepository.createQueryBuilder('rc')
          .innerJoinAndSelect('rc.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.currency', 'currency')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId })
          .andWhere('rn.partyRef = :partyId', { partyId });
        if (cellFilter !== 'receipt_cheques') {
           const opType = cellFilter === 'inCollection' ? 1 : cellFilter === 'collected' ? 2 : 3;
           const { ReceivedChequeOperationItem } = await import('../../domain/entities/received-cheque-operation-item.entity');
           rcQuery.innerJoin(ReceivedChequeOperationItem, 'opItem', 'opItem.receiptChequeRef = rc.receiptChequeId')
                  .innerJoin('opItem.operation', 'op')
                  .andWhere('op.operationType = :opType', { opType });
        }
        
        if (currencyId !== null) rcQuery.andWhere('rn.currencyRef = :currencyId', { currencyId });
        if (finalFromDate) rcQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) rcQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

        const rcList = await rcQuery.getMany();
        rcList.forEach((rc, idx) => {
          reportData.push({
            id: `rc_${rc.receiptChequeId}_${idx}`,
            documentType: 'رسید دریافت',
            transactionType: 'چک',
            documentNumber: rc.receiptNotification?.documentNumber || '',
            documentDate: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: rc.chequeNumber || '',
            itemDate: rc.dueDate ? new Date(rc.dueDate).toISOString().split('T')[0] : '',
            amount: Number(rc.amount || 0),
            receivedAmount: Number(rc.amount || 0),
            description: rc.description || '',
            currencyName: rc.receiptNotification?.currency?.title || '',
            
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).getTime() : 0,
          });
        });
        
        const rpnQuery = this.receiptPromissoryNoteRepository.createQueryBuilder('rpn')
          .innerJoinAndSelect('rpn.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.currency', 'currency')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId })
          .andWhere('rn.partyRef = :partyId', { partyId });
        if (currencyId !== null) rpnQuery.andWhere('rn.currencyRef = :currencyId', { currencyId });
        if (finalFromDate) rpnQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) rpnQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
        
        const rpnList = await rpnQuery.getMany();
        rpnList.forEach((rpn, idx) => {
          reportData.push({
            id: `rpn_${rpn.receiptPromissoryNoteId}_${idx}`,
            documentType: 'رسید دریافت',
            transactionType: 'سفته',
            documentNumber: rpn.receiptNotification?.documentNumber || '',
            documentDate: rpn.receiptNotification?.documentDate ? new Date(rpn.receiptNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: rpn.promissoryNoteNumber || '',
            itemDate: '',
            amount: Number(rpn.amount || 0),
            receivedAmount: Number(rpn.amount || 0),
            description: rpn.description || '',
            currencyName: rpn.receiptNotification?.currency?.title || '',
            
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: rpn.receiptNotification?.documentDate ? new Date(rpn.receiptNotification.documentDate).getTime() : 0,
          });
        });
        
        reportData.sort((a, b) => a.timestamp - b.timestamp);
        return { success: true, reportData };
      }

      if (cellFilter === 'payment_cheques') {
        const pcQuery = this.paymentChequeRepository.createQueryBuilder('pc')
          .innerJoinAndSelect('pc.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.currency', 'currency')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId })
          .andWhere('pn.partyRef = :partyId', { partyId });
        if (currencyId !== null) pcQuery.andWhere('pn.currencyRef = :currencyId', { currencyId });
        if (finalFromDate) pcQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) pcQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const pcList = await pcQuery.getMany();
        pcList.forEach((pc, idx) => {
          reportData.push({
            id: `pc_${pc.paymentChequeId}_${idx}`,
            documentType: 'اعلامیه پرداخت',
            transactionType: 'چک',
            documentNumber: pc.paymentNotification?.documentNumber || '',
            documentDate: pc.paymentNotification?.documentDate ? new Date(pc.paymentNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: pc.chequeNumber || '',
            itemDate: pc.dueDate ? new Date(pc.dueDate).toISOString().split('T')[0] : '',
            amount: Number(pc.amount || 0),
            paidAmount: Number(pc.amount || 0),
            description: pc.description || '',
            currencyName: pc.paymentNotification?.currency?.title || '',
            
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: pc.paymentNotification?.documentDate ? new Date(pc.paymentNotification.documentDate).getTime() : 0,
          });
        });

        const ppnRepo = this.paymentNotificationRepository.manager.getRepository('PaymentPromissoryNote');
        const ppnQuery = ppnRepo.createQueryBuilder('ppn')
          .innerJoinAndSelect('ppn.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.currency', 'currency')
          .leftJoinAndSelect('ppn.promissoryNoteItem', 'pni')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId })
          .andWhere('pn.partyRef = :partyId', { partyId });
        if (currencyId !== null) ppnQuery.andWhere('pn.currencyRef = :currencyId', { currencyId });
        if (finalFromDate) ppnQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) ppnQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const ppnList = await ppnQuery.getMany();
        ppnList.forEach((ppn: any, idx: number) => {
          reportData.push({
            id: `ppn_${ppn.paymentPromissoryNoteId}_${idx}`,
            documentType: 'اعلامیه پرداخت',
            transactionType: 'سفته',
            documentNumber: ppn.paymentNotification?.documentNumber || '',
            documentDate: ppn.paymentNotification?.documentDate ? new Date(ppn.paymentNotification.documentDate).toISOString().split('T')[0] : '',
            itemNumber: ppn.promissoryNoteItem?.promissoryNoteNumber || '',
            itemDate: ppn.dueDate ? new Date(ppn.dueDate).toISOString().split('T')[0] : '',
            amount: Number(ppn.amount || 0),
            paidAmount: Number(ppn.amount || 0),
            description: ppn.description || '',
            currencyName: ppn.paymentNotification?.currency?.title || '',
            
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
            timestamp: ppn.paymentNotification?.documentDate ? new Date(ppn.paymentNotification.documentDate).getTime() : 0,
          });
        });

        reportData.sort((a, b) => a.timestamp - b.timestamp);
        return { success: true, reportData };
      }
    }

    // Sort by date
    reportData.sort((a, b) => a.timestamp - b.timestamp);

    return {
      success: true,
      reportData
    };
  }

  @Get('report-data')
  async getReportData(
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @Query('verticalType') verticalType: string,
    @Query('horizontalType') horizontalType: string,
    @Query('verticalValue') verticalValue: string,
    @Query('hasYearFilter') hasYearFilterStr: string,
    @Query('fromYear') fromYear: string,
    @Query('toYear') toYear: string,
    @Query('hasMonthFilter') hasMonthFilterStr: string,
    @Query('fromMonth') fromMonth: string,
    @Query('toMonth') toMonth: string,
    @Query('hasDateFilter') hasDateFilterStr: string,
    @Query('fromCustomDate') fromCustomDate: string,
    @Query('toCustomDate') toCustomDate: string,
    @Query('pathStr') pathStr: string,
    @Query('pathIds') pathIds: string,
  ) {
    const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    const compId = this.requestContextService.getCompanyId() ?? 2;

    // Ensure proper digits
    const normalizeDigits = (str: string) => {
      if (!str) return str;
      return str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
                .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    };

    let finalFromDate = normalizeDigits(fromDate);
    let finalToDate = normalizeDigits(toDate);

    // 1. Year Filter (Fiscal Year selection)
    if (hasYearFilterStr === 'true') {
      try {
        const fyRepo = this.cashRepository.manager.getRepository(FiscalYear);
        const parsedFromYear = parseInt(normalizeDigits(fromYear), 10);
        const parsedToYear = parseInt(normalizeDigits(toYear), 10);
        if (!isNaN(parsedFromYear)) {
          const fromFy = await fyRepo.findOne({ where: { fiscalYearID: parsedFromYear } });
          if (fromFy) finalFromDate = typeof fromFy.startDate === 'string' ? fromFy.startDate : (fromFy.startDate as Date).toISOString().split('T')[0];
        }
        if (!isNaN(parsedToYear)) {
          const toFy = await fyRepo.findOne({ where: { fiscalYearID: parsedToYear } });
          if (toFy) finalToDate = typeof toFy.endDate === 'string' ? toFy.endDate : (toFy.endDate as Date).toISOString().split('T')[0];
        }
      } catch (err) {
        console.error('Error in fiscal year date resolution in rap review', err);
      }
    }

    // 2. Month Filter
    if (hasMonthFilterStr === 'true') {
      const monthsMap: Record<string, number> = {
        'فروردین': 1, 'اردیبهشت': 2, 'خرداد': 3,
        'تیر': 4, 'مرداد': 5, 'شهریور': 6,
        'مهر': 7, 'آبان': 8, 'آذر': 9,
        'دی': 10, 'بهمن': 11, 'اسفند': 12
      };

      try {
        const mStart = moment(finalFromDate || fromDate, 'YYYY-MM-DD');
        const jYear = mStart.jYear(); // E.g., 1403
        
        const fromMonthIdx = monthsMap[fromMonth] || 1;
        const toMonthIdx = monthsMap[toMonth] || 12;

        const startJalaliStr = `${jYear}/${String(fromMonthIdx).padStart(2, '0')}/01`;
        const endMonthLastDay = toMonthIdx <= 6 ? 31 : (toMonthIdx <= 11 ? 30 : 29);
        const endJalaliStr = `${jYear}/${String(toMonthIdx).padStart(2, '0')}/${endMonthLastDay}`;

        finalFromDate = moment(startJalaliStr, 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD');
        const mEnd = moment(endJalaliStr, 'jYYYY/jMM/jDD');
        if (toMonthIdx === 12 && mEnd.isValid()) {
          mEnd.add(1, 'month').startOf('month').subtract(1, 'day');
        }
        finalToDate = mEnd.locale('en').format('YYYY-MM-DD');
      } catch (err) {
        console.error('Error in month range calculation in rap review', err);
      }
    }

    // 3. Custom Date Filter
    if (hasDateFilterStr === 'true') {
      const cleanFromCustom = normalizeDigits(fromCustomDate || '');
      const cleanToCustom = normalizeDigits(toCustomDate || '');

      try {
        if (cleanFromCustom) {
          finalFromDate = moment(cleanFromCustom, 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD');
        }
        if (cleanToCustom) {
          finalToDate = moment(cleanToCustom, 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD');
        }
      } catch (err) {
        console.error('Error in custom date normalization in rap review', err);
      }
    }

    finalFromDate = normalizeDigits(finalFromDate);
    finalToDate = normalizeDigits(finalToDate);

    if (verticalType === 'cash' && (horizontalType === 'accounting_operation' || horizontalType === 'reason') && pathStr && pathStr.includes('bank_account')) {
      const cashId = Number(verticalValue);
      
      const pathTypes = pathStr.split(',');
      const pathIdsArray = pathIds ? pathIds.split(',') : [];
      let bankId: number | null = null;
      const bankIndex = pathTypes.indexOf('bank_account');
      if (bankIndex !== -1 && pathIdsArray.length > bankIndex) {
         bankId = Number(pathIdsArray[bankIndex]);
      }

      const { VoucherItem } = await import('../../../accounting/domain/entities/voucher-item.entity');
      const viRepo = this.cashRepository.manager.getRepository(VoucherItem);
      
      const voucherItems = await viRepo.createQueryBuilder('vi')
        .innerJoinAndSelect('vi.voucher', 'v')
        .where('v.companyRef = :compId', { compId })
        .andWhere('v.businessStructureRef = :bsId', { bsId })
        .getMany();

      const voucherMapByTracking = new Map<string, any>();
      const voucherMapByDocNumber = new Map<string, any>();

      voucherItems.forEach(item => {
        if (item.trackingNumber) {
          const cleanTrack = item.trackingNumber.trim();
          if (!voucherMapByTracking.has(cleanTrack)) {
            voucherMapByTracking.set(cleanTrack, item.voucher);
          }
        }
        if (item.voucher?.referenceNumber) {
          const cleanRef = item.voucher.referenceNumber.trim();
          if (!voucherMapByDocNumber.has(cleanRef)) {
            voucherMapByDocNumber.set(cleanRef, item.voucher);
          }
        }
      });

      const findVoucher = (trackingNumber?: string, docNumber?: string) => {
        if (trackingNumber) {
          const clean = trackingNumber.trim();
          if (voucherMapByTracking.has(clean)) return voucherMapByTracking.get(clean);
          if (voucherMapByDocNumber.has(clean)) return voucherMapByDocNumber.get(clean);
        }
        if (docNumber) {
          const clean = docNumber.trim();
          if (voucherMapByTracking.has(clean)) return voucherMapByTracking.get(clean);
          if (voucherMapByDocNumber.has(clean)) return voucherMapByDocNumber.get(clean);
        }
        return null;
      };

      const depositQuery = this.receiptCashRepository.createQueryBuilder('rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rc.accountingSetting', 'as')
        .leftJoinAndSelect('rc.reason', 'reason')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere('rc.cashRef = :cashId', { cashId });
        
      if (bankId !== null) {
        depositQuery.innerJoin('rn.depositItems', 'rd', 'rd.bankAccountRef = :bankId', { bankId });
      }

      if (finalFromDate) depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

      const depositsList = await depositQuery.getMany();

      const withdrawalQuery = this.paymentWithdrawalRepository.createQueryBuilder('pw')
        .innerJoinAndSelect('pw.paymentNotification', 'pn')
        .leftJoinAndSelect('pw.accountingSetting', 'as')
        .leftJoinAndSelect('pw.reason', 'reason')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('pn.paymentType = :paymentType', { paymentType: 4 })
        .andWhere('pn.partyRef = :cashId', { cashId });
        
      if (bankId !== null) {
        withdrawalQuery.andWhere('pw.bankAccountRef = :bankId', { bankId });
      }

      if (finalFromDate) withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

      const withdrawalsList = await withdrawalQuery.getMany();

      const reportData: any[] = [];

      depositsList.forEach((rc, rcIdx) => {
        const v = findVoucher(undefined, rc.receiptNotification?.documentNumber);
        reportData.push({
          id: `rc_${rc.receiptCashId}_${rcIdx}`,
          documentType: 'رسید دریافت',
          receiptNotificationId: rc.receiptNotification?.receiptNotificationId,
          documentNumber: rc.receiptNotification?.documentNumber || '',
          docDate: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          docNum: rc.receiptNotification?.documentNumber || '',
          opCode: horizontalType === 'reason' ? (rc.reason?.Code || '') : (rc.accountingSetting?.code || ''),
          opTitle: horizontalType === 'reason' ? (rc.reason?.Title || '') : (rc.accountingSetting?.title || ''),
          description: rc.description || '',
          amount: Number(rc.amount || 0),
          voucherId: v?.voucherId || '',
          voucherNum: v?.voucherNumber || '',
          voucherDailyNum: v?.dailyNumber || '',
          voucherDate: v?.voucherDate ? new Date(v.voucherDate).toISOString().split('T')[0] : '',
          timestamp: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).getTime() : 0,
        });
      });

      withdrawalsList.forEach((pw, pwIdx) => {
        const v = findVoucher(undefined, pw.paymentNotification?.documentNumber);
        reportData.push({
          id: `pw_${pw.paymentWithdrawalId}_${pwIdx}`,
          documentType: 'اعلامیه پرداخت',
          paymentNotificationId: pw.paymentNotification?.paymentNotificationId,
          documentNumber: pw.paymentNotification?.documentNumber || '',
          docDate: pw.paymentNotification?.documentDate ? new Date(pw.paymentNotification.documentDate).toISOString().split('T')[0] : '',
          docNum: pw.paymentNotification?.documentNumber || '',
          opCode: horizontalType === 'reason' ? (pw.reason?.Code || '') : (pw.accountingSetting?.code || ''),
          opTitle: horizontalType === 'reason' ? (pw.reason?.Title || '') : (pw.accountingSetting?.title || ''),
          description: pw.description || '',
          amount: Number(pw.amount || 0),
          voucherId: v?.voucherId || '',
          voucherNum: v?.voucherNumber || '',
          voucherDailyNum: v?.dailyNumber || '',
          voucherDate: v?.voucherDate ? new Date(v.voucherDate).toISOString().split('T')[0] : '',
          timestamp: pw.paymentNotification?.documentDate ? new Date(pw.paymentNotification.documentDate).getTime() : 0,
        });
      });

      reportData.sort((a, b) => a.timestamp - b.timestamp);

      return {
        success: true,
        reportData,
      };
    }

    if (verticalType === 'bank_account' && horizontalType === 'counterparty') {
      const bankId = Number(verticalValue);
      const map = new Map();
      const getKey = (partyId: any, currencyId: any) => `${partyId}_${currencyId}`;
      const addValue = (partyRef: any, currencyRef: any, field: string, amount: any, party: any, currency: any) => {
        if (!partyRef) return;
        const key = getKey(partyRef, currencyRef);
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            partyRef,
            currencyRef,
            title: party ? (((party.firstName || '') + ' ' + (party.lastName || '')).trim() || party.detailedAccount?.detailedAccountName || '') : '',
            code: party?.detailedAccount?.detailedAccountCode || '',
            currencyName: currency?.title || '',
            receive: 0,
            payment: 0,
            balance: 0,
            receiptCheques: 0,
            inCollection: 0,
            collected: 0,
            protested: 0,
            paymentCheques: 0,
            assigned: 0,
            returnedAssigned: 0,
            returnedReceived: 0,
            returnedPaid: 0,
          });
        }
        const row = map.get(key);
        row[field] += Number(amount || 0);
      };

      const { ReceiptNotification } = await import('../../domain/entities/receipt-notification.entity');
      const { PaymentNotification } = await import('../../domain/entities/payment-notification.entity');
      const { ReceivedChequeOperation } = await import('../../domain/entities/received-cheque-operation.entity');

      // 1. Deposits to this Bank Account -> Receive
      const rnQuery = this.receiptCashRepository.manager.createQueryBuilder(ReceiptNotification, 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('party.detailedAccount', 'detailedAccount')
        .leftJoinAndSelect('rn.currency', 'currency')
        .innerJoinAndSelect('rn.depositItems', 'depositItems', 'depositItems.bankAccountRef = :bankId', { bankId })
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere('rn.partyRef IS NOT NULL');
      if (finalFromDate) rnQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) rnQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      const rns = await rnQuery.getMany();
      for (const rn of rns) {
        let receive = 0;
        (rn as any).depositItems?.forEach((d: any) => receive += Number(d.amount || 0));
        if (receive > 0) addValue(rn.partyRef, rn.currencyRef, 'receive', receive, rn.party, rn.currency);
      }

      // 2. Withdrawals from this Bank Account -> Payment
      const pnQuery = this.paymentCashRepository.manager.createQueryBuilder(PaymentNotification, 'pn')
        .leftJoinAndSelect('pn.party', 'party')
        .leftJoinAndSelect('party.detailedAccount', 'detailedAccount')
        .leftJoinAndSelect('pn.currency', 'currency')
        .innerJoinAndSelect('pn.withdrawalItems', 'withdrawalItems', 'withdrawalItems.bankAccountRef = :bankId', { bankId })
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('pn.partyRef IS NOT NULL');
      if (finalFromDate) pnQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) pnQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      const pns = await pnQuery.getMany();
      for (const pn of pns) {
        let payment = 0;
        (pn as any).withdrawalItems?.forEach((d: any) => payment += Number(d.amount || 0));
        if (payment > 0) addValue(pn.partyRef, pn.currencyRef, 'payment', payment, pn.party, pn.currency);
      }

      // 3. Payment Cheques from this Bank Account -> paymentCheques
      const pChequeQuery = this.paymentCashRepository.manager.createQueryBuilder(PaymentNotification, 'pn')
        .leftJoinAndSelect('pn.party', 'party')
        .leftJoinAndSelect('party.detailedAccount', 'detailedAccount')
        .leftJoinAndSelect('pn.currency', 'currency')
        .innerJoinAndSelect('pn.chequeItems', 'chequeItems', 'chequeItems.bankAccountRef = :bankId', { bankId })
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('pn.partyRef IS NOT NULL');
      if (finalFromDate) pChequeQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) pChequeQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      const pCheques = await pChequeQuery.getMany();
      for (const pn of pCheques) {
        let paymentCheques = 0;
        (pn as any).chequeItems?.forEach((c: any) => paymentCheques += Number(c.amount || 0));
        if (paymentCheques > 0) addValue(pn.partyRef, pn.currencyRef, 'paymentCheques', paymentCheques, pn.party, pn.currency);
      }

      // 4. Received Cheque Operations in this Bank Account (In Collection, Collected, Protested)
      const opQuery = this.receivedChequeOperationRepository.manager.createQueryBuilder(ReceivedChequeOperation, 'op')
        .innerJoinAndSelect('op.items', 'items')
        .innerJoinAndSelect('items.receiptCheque', 'rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('party.detailedAccount', 'detailedAccount')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('op.companyRef = :compId', { compId })
        .andWhere('op.businessStructureRef = :bsId', { bsId })
        .andWhere('op.bankAccountRef = :bankId', { bankId })
        .andWhere('rn.partyRef IS NOT NULL');
      if (finalFromDate) opQuery.andWhere('op.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) opQuery.andWhere('op.documentDate <= :finalToDate', { finalToDate });
      const ops = await opQuery.getMany();
      for (const op of ops) {
        const opType = Number(op.operationType);
        for (const item of (op as any).items || []) {
          const rc = item.receiptCheque;
          if (!rc || !rc.receiptNotification) continue;
          const rn = rc.receiptNotification;
          
          let field = null;
          if (opType === 1) field = 'inCollection';
          else if (opType === 2) field = 'collected';
          else if (opType === 3) field = 'protested';
          
          if (field) addValue(rn.partyRef, rn.currencyRef, field, rc.amount, rn.party, rn.currency);
        }
      }

      const reportData = Array.from(map.values()).map(row => {
        row.balance = Number(row.receive) - Number(row.payment);
        return row;
      });
      return { 
        success: true, 
        reportData, 
        horizontalConfig: { 
          detailedType_6: true,
          payment_promissory_note: true,
          receipt_promissory_note: true,
          assigned_to_bank: true,
          protested: true,
          detailedType_1: true,
          detailedType_2: true,
          detailedType_5: true,
          accounting_operation: true,
          reason: true,
          currency: true
        } 
      };
    }

    if (verticalType === 'counterparty' && horizontalType === 'counterparty') {
      const map = new Map();
      const getKey = (partyId: any, currencyId: any) => `${partyId}_${currencyId}`;

      const addValue = (partyRef: any, currencyRef: any, field: string, amount: any, party: any, currency: any) => {
        if (!partyRef) return;
        const key = getKey(partyRef, currencyRef);
        if (!map.has(key)) {
          map.set(key, {
            id: key,
            partyRef,
            currencyRef,
            title: party ? (((party.firstName || '') + ' ' + (party.lastName || '')).trim() || party.detailedAccount?.detailedAccountName || '') : '',
            code: party?.detailedAccount?.detailedAccountCode || '',
            currencyName: currency?.title || '',
            receive: 0,
            payment: 0,
            balance: 0,
            receiptCheques: 0,
            inCollection: 0,
            collected: 0,
            protested: 0,
            paymentCheques: 0,
            assigned: 0,
            returnedAssigned: 0,
            returnedReceived: 0,
            returnedPaid: 0,
          });
        }
        const row = map.get(key);
        row[field] += Number(amount || 0);
      };

      const { ReceiptNotification } = await import('../../domain/entities/receipt-notification.entity');
      const { PaymentNotification } = await import('../../domain/entities/payment-notification.entity');
      const { ReceivedChequeOperation } = await import('../../domain/entities/received-cheque-operation.entity');

      // 1. Receipt Cash & Deposit -> Receive
      const rnQuery = this.receiptCashRepository.manager.createQueryBuilder(ReceiptNotification, 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('party.detailedAccount', 'detailedAccount')
        .leftJoinAndSelect('rn.currency', 'currency')
        .leftJoinAndSelect('rn.cashItems', 'cashItems')
        .leftJoinAndSelect('rn.depositItems', 'depositItems')
        .leftJoinAndSelect('rn.chequeItems', 'chequeItems')
        .leftJoinAndSelect('rn.returnedPaymentAssignments', 'returnedPaymentAssignments')
        .leftJoinAndSelect('rn.returnedPaidCheques', 'returnedPaidCheques')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere('rn.partyRef IS NOT NULL');

      if (finalFromDate) rnQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) rnQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

      const rns = await rnQuery.getMany();
      for (const rn of rns) {
        let receive = 0;
        (rn as any).cashItems?.forEach((c: any) => receive += Number(c.amount || 0));
        (rn as any).depositItems?.forEach((d: any) => receive += Number(d.amount || 0));
        if (receive > 0) addValue(rn.partyRef, rn.currencyRef, 'receive', receive, rn.party, rn.currency);

        let receiptCheques = 0;
        (rn as any).chequeItems?.forEach((c: any) => receiptCheques += Number(c.amount || 0));
        if (receiptCheques > 0) addValue(rn.partyRef, rn.currencyRef, 'receiptCheques', receiptCheques, rn.party, rn.currency);

        let returnedAssigned = 0;
        (rn as any).returnedPaymentAssignments?.forEach((c: any) => returnedAssigned += Number(c.amount || 0));
        if (returnedAssigned > 0) addValue(rn.partyRef, rn.currencyRef, 'returnedAssigned', returnedAssigned, rn.party, rn.currency);

        let returnedPaid = 0;
        (rn as any).returnedPaidCheques?.forEach((c: any) => returnedPaid += Number(c.amount || 0));
        if (returnedPaid > 0) addValue(rn.partyRef, rn.currencyRef, 'returnedPaid', returnedPaid, rn.party, rn.currency);
      }

      // 2. Payment Cash & Withdrawal -> Payment
      const pnQuery = this.paymentCashRepository.manager.createQueryBuilder(PaymentNotification, 'pn')
        .leftJoinAndSelect('pn.party', 'party')
        .leftJoinAndSelect('party.detailedAccount', 'detailedAccount')
        .leftJoinAndSelect('pn.currency', 'currency')
        .leftJoinAndSelect('pn.cashItems', 'cashItems')
        .leftJoinAndSelect('pn.withdrawalItems', 'withdrawalItems')
        .leftJoinAndSelect('pn.chequeItems', 'chequeItems')
        .leftJoinAndSelect('pn.assignmentItems', 'assignmentItems')
        .leftJoinAndSelect('pn.returnedReceivedCheques', 'returnedReceivedCheques')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('pn.partyRef IS NOT NULL');

      if (finalFromDate) pnQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) pnQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

      const pns = await pnQuery.getMany();
      for (const pn of pns) {
        let payment = 0;
        (pn as any).cashItems?.forEach((c: any) => payment += Number(c.amount || 0));
        (pn as any).withdrawalItems?.forEach((d: any) => payment += Number(d.amount || 0));
        if (payment > 0) addValue(pn.partyRef, pn.currencyRef, 'payment', payment, pn.party, pn.currency);

        let paymentCheques = 0;
        (pn as any).chequeItems?.forEach((c: any) => paymentCheques += Number(c.amount || 0));
        if (paymentCheques > 0) addValue(pn.partyRef, pn.currencyRef, 'paymentCheques', paymentCheques, pn.party, pn.currency);

        let assigned = 0;
        (pn as any).assignmentItems?.forEach((c: any) => assigned += Number(c.amount || 0));
        if (assigned > 0) addValue(pn.partyRef, pn.currencyRef, 'assigned', assigned, pn.party, pn.currency);

        let returnedReceived = 0;
        (pn as any).returnedReceivedCheques?.forEach((c: any) => returnedReceived += Number(c.amount || 0));
        if (returnedReceived > 0) addValue(pn.partyRef, pn.currencyRef, 'returnedReceived', returnedReceived, pn.party, pn.currency);
      }

      // 3. Received Cheque Operations (In Collection, Collected, Protested)
      const opQuery = this.receivedChequeOperationRepository.manager.createQueryBuilder(ReceivedChequeOperation, 'op')
        .innerJoinAndSelect('op.items', 'items')
        .innerJoinAndSelect('items.receiptCheque', 'rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.party', 'party')
        .leftJoinAndSelect('party.detailedAccount', 'detailedAccount')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('op.companyRef = :compId', { compId })
        .andWhere('op.businessStructureRef = :bsId', { bsId })
        .andWhere('rn.partyRef IS NOT NULL');

      if (finalFromDate) opQuery.andWhere('op.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) opQuery.andWhere('op.documentDate <= :finalToDate', { finalToDate });

      const ops = await opQuery.getMany();
      for (const op of ops) {
        const opType = Number(op.operationType);
        for (const item of (op as any).items || []) {
          const rc = item.receiptCheque;
          if (!rc || !rc.receiptNotification) continue;
          const rn = rc.receiptNotification;
          
          let field = null;
          if (opType === 1) field = 'inCollection'; // واگذار به بانک
          else if (opType === 2) {
            if (Number(item.chequeStatus) === 2) {
              field = 'protested'; // واخواست
            } else {
              field = 'collected'; // وصول
            }
          }
          
          if (field) {
            addValue(rn.partyRef, rn.currencyRef, field, rc.amount, rn.party, rn.currency);
          }
        }
      }

      const reportData = Array.from(map.values()).map(row => {
        row.balance = Number(row.receive) - Number(row.payment);
        return row;
      });

      return {
        success: true,
        reportData,
        horizontalConfig: { 
          detailedType_6: true,
          payment_promissory_note: true,
          receipt_promissory_note: true,
          assigned_to_bank: true,
          protested: true,
          detailedType_1: true,
          detailedType_2: true,
          detailedType_5: true,
          accounting_operation: true,
          reason: true,
          currency: true
        }
      };
    }

    if (verticalType === 'counterparty' && horizontalType === 'receipt_promissory_note') {
      const parts = String(verticalValue).split('_');
      const partyId = Number(parts[0]);

      const reportData: any[] = [];
      const isShared = await this.isBasicInfoShared(bsId);

      // Cheques queries
      const rcQuery = this.receiptChequeRepository.createQueryBuilder('rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.partyRef = :partyId', { partyId });

      if (finalFromDate) rcQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
      if (finalToDate) rcQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
      
      if (isShared) {
        rcQuery.andWhere('rn.businessStructureRef = :bsId', { bsId });
      } else {
        rcQuery.andWhere('rn.companyRef = :compId', { compId });
      }

      const rcList = await rcQuery.getMany();
      rcList.forEach((rc, idx) => {
          reportData.push({
          id: `rc_${rc.receiptChequeId}_${idx}`,
          docType: 'چک',
          documentNumber: rc.receiptNotification?.documentNumber || '',
          documentDate: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: rc.chequeNumber || '',
          itemDate: rc.dueDate ? new Date(rc.dueDate).toISOString().split('T')[0] : '',
          amount: Number(rc.amount || 0),
          description: rc.description || '',
          currencyName: rc.receiptNotification?.currency?.title || '',
          
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
          timestamp: rc.receiptNotification?.documentDate ? new Date(rc.receiptNotification.documentDate).getTime() : 0,
        });
      });

      // Promissory Notes queries
      const rpQuery = this.receiptPromissoryNoteRepository.createQueryBuilder('rp')
        .innerJoinAndSelect('rp.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.partyRef = :partyId', { partyId });

      if (finalFromDate) rpQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
      if (finalToDate) rpQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });

      if (isShared) {
        rpQuery.andWhere('rn.businessStructureRef = :bsId', { bsId });
      } else {
        rpQuery.andWhere('rn.companyRef = :compId', { compId });
      }

      const rpList = await rpQuery.getMany();
      rpList.forEach((rp, idx) => {
        reportData.push({
          id: `rp_${rp.receiptPromissoryNoteId}_${idx}`,
          docType: 'سفته',
          documentNumber: rp.receiptNotification?.documentNumber || '',
          documentDate: rp.receiptNotification?.documentDate ? new Date(rp.receiptNotification.documentDate).toISOString().split('T')[0] : '',
          itemNumber: rp.promissoryNoteNumber || '',
          itemDate: '',
          amount: Number(rp.amount || 0),
          description: rp.description || '',
          currencyName: rp.receiptNotification?.currency?.title || '',
          
            voucherNumber: '',
            dailyNumber: '',
            voucherDate: '',
          timestamp: rp.receiptNotification?.documentDate ? new Date(rp.receiptNotification.documentDate).getTime() : 0,
        });
      });

      // Sort by date
      reportData.sort((a, b) => a.timestamp - b.timestamp);

      return {
        success: true,
        reportData,
        horizontalConfig: { receipt_promissory_note: true }
      };
    }



    if (verticalType === 'payment_promissory_note' && horizontalType === 'payment_promissory_note') {
      console.log('Fetching payment promissory note report');
      const reportData: any[] = [];
      const { ReceiptReturnedPaidCheque } = await import('../../domain/entities/receipt-returned-paid-cheque.entity');
      const { ReceiptReturnedPaymentPromissoryNote } = await import('../../domain/entities/receipt-returned-payment-promissory-note.entity');
      const { PaymentPromissoryNote } = await import('../../domain/entities/payment-promissory-note.entity');

      const rcRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaidCheque);
      const rpRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaymentPromissoryNote);
      const ppnRepo = this.cashRepository.manager.getRepository(PaymentPromissoryNote);

      const returnedChequesQuery = rcRepo.createQueryBuilder('rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });
      if (finalFromDate) returnedChequesQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) returnedChequesQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      const returnedCheques = await returnedChequesQuery.getMany();

      const returnedPromissoryQuery = rpRepo.createQueryBuilder('rp')
        .innerJoinAndSelect('rp.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });
      if (finalFromDate) returnedPromissoryQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) returnedPromissoryQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      const returnedPromissory = await returnedPromissoryQuery.getMany();

      const paymentChequesQuery = this.paymentChequeRepository.createQueryBuilder('pc')
        .innerJoinAndSelect('pc.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });
      if (finalFromDate) paymentChequesQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) paymentChequesQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      const paymentCheques = await paymentChequesQuery.getMany();

      const paymentPromissoryQuery = ppnRepo.createQueryBuilder('ppn')
        .innerJoinAndSelect('ppn.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });
      if (finalFromDate) paymentPromissoryQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) paymentPromissoryQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      const paymentPromissory = await paymentPromissoryQuery.getMany();

      const clearedChequesQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
        .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
        .where('pdc.companyRef = :compId', { compId })
        .andWhere('pdc.businessStructureRef = :bsId', { bsId })
        .andWhere('item.documentType = :docType', { docType: 'cheque' });
      if (finalFromDate) clearedChequesQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
      if (finalToDate) clearedChequesQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });
      const clearedCheques = await clearedChequesQuery.getMany();
      const clearedChequeIds = new Set(clearedCheques.map(c => Number(c.documentId)));

      const clearedPromissoryQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
        .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
        .where('pdc.companyRef = :compId', { compId })
        .andWhere('pdc.businessStructureRef = :bsId', { bsId })
        .andWhere('item.documentType = :docType', { docType: 'promissory_note' });
      if (finalFromDate) clearedPromissoryQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
      if (finalToDate) clearedPromissoryQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });
      const clearedPromissory = await clearedPromissoryQuery.getMany();
      const clearedPromissoryIds = new Set(clearedPromissory.map(c => Number(c.documentId)));

      const currencies = new Map<number, { id: number, name: string }>();
      
      const getCurrency = (pn: any, rn: any) => {
        if (pn?.currency) {
          currencies.set(Number(pn.currency.currencyId), { id: Number(pn.currency.currencyId), name: pn.currency.title });
          return Number(pn.currency.currencyId);
        }
        if (rn?.currency) {
          currencies.set(Number(rn.currency.currencyId), { id: Number(rn.currency.currencyId), name: rn.currency.title });
          return Number(rn.currency.currencyId);
        }
        currencies.set(0, { id: 0, name: '-' });
        return 0;
      };

      const resultsByCurrency = new Map<number, { 
        cheque_deposit: number, 
        cheque_payment: number,
        promissory_deposit: number,
        promissory_payment: number
      }>();

      const getCurrRes = (currId: number) => {
        if (!resultsByCurrency.has(currId)) {
          resultsByCurrency.set(currId, { cheque_deposit: 0, cheque_payment: 0, promissory_deposit: 0, promissory_payment: 0 });
        }
        return resultsByCurrency.get(currId)!;
      };

      for (const rc of returnedCheques) {
        const currId = getCurrency(null, rc.receiptNotification);
        getCurrRes(currId).cheque_deposit += Number(rc.amount || 0);
      }
      for (const rp of returnedPromissory) {
        const currId = getCurrency(null, rp.receiptNotification);
        getCurrRes(currId).promissory_deposit += Number(rp.amount || 0);
      }

      for (const pc of paymentCheques) {
        const currId = getCurrency(pc.paymentNotification, null);
        const amount = Number(pc.amount || 0);
        const isCleared = clearedChequeIds.has(Number(pc.paymentChequeId));
        if (!isCleared) {
           getCurrRes(currId).cheque_payment += amount;
        }
      }

      for (const pp of paymentPromissory) {
        const currId = getCurrency(pp.paymentNotification, null);
        const amount = Number(pp.amount || 0);
        const isCleared = clearedPromissoryIds.has(Number(pp.paymentPromissoryNoteId));
        if (!isCleared) {
           getCurrRes(currId).promissory_payment += amount;
        }
      }

      if (currencies.size === 0) {
        currencies.set(0, { id: 0, name: '-' });
      }

      for (const [currId, currInfo] of currencies.entries()) {
        const res = getCurrRes(currId);
        if (res.cheque_deposit !== 0 || res.cheque_payment !== 0 || currencies.size === 1) {
          reportData.push({
            id: `cheque_${currId}`,
            code: '-',
            title: 'چک',
            docType: 'چک',
            deposits: res.cheque_deposit,
            withdrawals: res.cheque_payment,
            balance: res.cheque_deposit - res.cheque_payment,
            balanceType: (res.cheque_deposit - res.cheque_payment) >= 0 ? 'بدهکار' : 'بستانکار',
            currencyName: currInfo.name
          });
        }
        if (res.promissory_deposit !== 0 || res.promissory_payment !== 0 || currencies.size === 1) {
          reportData.push({
            id: `promissory_${currId}`,
            code: '-',
            title: 'سفته',
            docType: 'سفته',
            deposits: res.promissory_deposit,
            withdrawals: res.promissory_payment,
            balance: res.promissory_deposit - res.promissory_payment,
            balanceType: (res.promissory_deposit - res.promissory_payment) >= 0 ? 'بدهکار' : 'بستانکار',
            currencyName: currInfo.name
          });
        }
      }

      return {
        success: true,
        reportData,
        horizontalConfig: { 
          payment_promissory_note: true, 
          detailedType_1: true, 
          detailedType_5: true, 
          detailedType_6: true, 
          accounting_operation: true, 
          reason: true, 
          currency: true 
        },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'payment_promissory_note' && horizontalType === 'bank_account') {
      let currId: number | null = null;

      if (verticalValue && verticalValue.startsWith('cheque_')) {
        currId = Number(verticalValue.split('_')[1]);
      }

      const bankData = new Map<string, {
        code: string;
        title: string;
        currencyName: string;
        deposits: number;
        withdrawals: number;
      }>();

      const getBankKey = (bankId: number, currId: number) => `${bankId}_${currId}`;

      const { ReceiptReturnedPaidCheque } = await import('../../domain/entities/receipt-returned-paid-cheque.entity');
      const rcRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaidCheque);

      const rcQuery = rcRepo.createQueryBuilder('rc')
        .innerJoinAndSelect('rc.paymentCheque', 'pc')
        .innerJoinAndSelect('pc.bankAccount', 'bank')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (currId !== null) {
        if (currId === 0) rcQuery.andWhere('rn.currencyRef IS NULL');
        else rcQuery.andWhere('rn.currencyRef = :currId', { currId });
      }
      if (finalFromDate) rcQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) rcQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

      const rcList = await rcQuery.getMany();
      for (const rc of rcList) {
        const bank = rc.paymentCheque?.bankAccount;
        if (!bank) continue;
        const currency = rc.receiptNotification?.currency;
        const cId = currency ? Number(currency.currencyID) : 0;
        const key = getBankKey(Number(bank.bankAccountId), cId);
        if (!bankData.has(key)) {
          bankData.set(key, {
            code: bank.detailedCode?.toString() || bank.bankAccountId.toString(),
            title: bank.title || '-',
            currencyName: currency?.title || '-',
            deposits: 0,
            withdrawals: 0
          });
        }
        bankData.get(key)!.deposits += Number(rc.amount || 0);
      }

      const pcQuery = this.paymentChequeRepository.createQueryBuilder('pc')
        .innerJoinAndSelect('pc.bankAccount', 'bank')
        .innerJoinAndSelect('pc.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (currId !== null) {
        if (currId === 0) pcQuery.andWhere('pn.currencyRef IS NULL');
        else pcQuery.andWhere('pn.currencyRef = :currId', { currId });
      }
      if (finalFromDate) pcQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) pcQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

      const pcList = await pcQuery.getMany();
      
      const clearedChequesQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
        .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
        .where('pdc.companyRef = :compId', { compId })
        .andWhere('pdc.businessStructureRef = :bsId', { bsId })
        .andWhere('item.documentType = :docType', { docType: 'cheque' });
      
      if (finalFromDate) clearedChequesQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
      if (finalToDate) clearedChequesQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });
      
      const clearedCheques = await clearedChequesQuery.getMany();
      const clearedChequeIds = new Set(clearedCheques.map(c => Number(c.documentId)));

      for (const pc of pcList) {
        const bank = pc.bankAccount;
        if (!bank) continue;
        
        if (clearedChequeIds.has(Number(pc.paymentChequeId))) continue;

        const currency = pc.paymentNotification?.currency;
        const cId = currency ? Number(currency.currencyID) : 0;
        const key = getBankKey(Number(bank.bankAccountId), cId);
        if (!bankData.has(key)) {
          bankData.set(key, {
            code: bank.detailedCode?.toString() || bank.bankAccountId.toString(),
            title: bank.title || '-',
            currencyName: currency?.title || '-',
            deposits: 0,
            withdrawals: 0
          });
        }
        bankData.get(key)!.withdrawals += Number(pc.amount || 0);
      }

      const reportData = Array.from(bankData.entries()).map(([key, data]) => {
        const [bId] = key.split('_');
        return {
          id: bId,
          code: data.code,
          title: data.title,
          currencyName: data.currencyName,
          deposits: data.deposits,
          withdrawals: data.withdrawals,
          balance: Math.abs(data.deposits - data.withdrawals)
        };
      });

      return {
        success: true,
        reportData,
        horizontalConfig: { group: false, total: false, specific: false, detailed_1: true, currency: true }
      };
    }

    if (verticalType === 'payment_promissory_note' && horizontalType === 'counterparty') {
      let currId: number | null = null;
      let filterType: 'cheque' | 'promissory' | 'all' = 'all';

      if (verticalValue === 'cheque') {
        filterType = 'cheque';
      } else if (verticalValue === 'promissory') {
        filterType = 'promissory';
      } else if (verticalValue && verticalValue.startsWith('cheque_')) {
        filterType = 'cheque';
        currId = Number(verticalValue.split('_')[1]);
      } else if (verticalValue && verticalValue.startsWith('promissory_')) {
        filterType = 'promissory';
        currId = Number(verticalValue.split('_')[1]);
      }

      const partyData = new Map<string, {
        code: string;
        title: string;
        currencyName: string;
        deposits: number;
        withdrawals: number;
      }>();

      const getPartyKey = (partyId: number, currId: number) => `${partyId}_${currId}`;

      if (filterType === 'cheque' || filterType === 'all') {
        const { ReceiptReturnedPaidCheque } = await import('../../domain/entities/receipt-returned-paid-cheque.entity');
        const rcRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaidCheque);

        const rcQuery = rcRepo.createQueryBuilder('rc')
          .innerJoinAndSelect('rc.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.party', 'party')
          .leftJoinAndSelect('rn.currency', 'currency')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
  if (currId === 0) rcQuery.andWhere('rn.currencyRef IS NULL');
  else rcQuery.andWhere('rn.currencyRef = :currId', { currId });
}
        if (finalFromDate) rcQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) rcQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

        const rcList = await rcQuery.getMany();
        for (const rc of rcList) {
          const party = rc.receiptNotification?.party;
          if (!party) continue;
          const currency = rc.receiptNotification?.currency;
          const cId = currency ? Number(currency.currencyID) : 0;
          const key = getPartyKey(Number(party.partyId), cId);
          if (!partyData.has(key)) {
            partyData.set(key, {
              code: party.detailedAccount?.code || party.partyId.toString(),
              title: `${party.firstName || ''} ${party.lastName || ''}`.trim(),
              currencyName: currency?.title || '-',
              deposits: 0,
              withdrawals: 0
            });
          }
          partyData.get(key)!.deposits += Number(rc.amount || 0);
        }

        const pcQuery = this.paymentChequeRepository.createQueryBuilder('pc')
          .innerJoinAndSelect('pc.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.party', 'party')
          .leftJoinAndSelect('pn.currency', 'currency')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
  if (currId === 0) pcQuery.andWhere('pn.currencyRef IS NULL');
  else pcQuery.andWhere('pn.currencyRef = :currId', { currId });
}
        if (finalFromDate) pcQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) pcQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const pcList = await pcQuery.getMany();
        
        const clearedChequesQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
          .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
          .where('pdc.companyRef = :compId', { compId })
          .andWhere('pdc.businessStructureRef = :bsId', { bsId })
          .andWhere('item.documentType = :docType', { docType: 'cheque' });
        
        if (finalFromDate) clearedChequesQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
        if (finalToDate) clearedChequesQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });
        
        const clearedCheques = await clearedChequesQuery.getMany();
        const clearedChequeIds = new Set(clearedCheques.map(c => Number(c.documentId)));

        for (const pc of pcList) {
          const party = pc.paymentNotification?.party;
          if (!party) continue;
          
          if (clearedChequeIds.has(Number(pc.paymentChequeId))) continue;

          const currency = pc.paymentNotification?.currency;
          const cId = currency ? Number(currency.currencyID) : 0;
          const key = getPartyKey(Number(party.partyId), cId);
          if (!partyData.has(key)) {
            partyData.set(key, {
              code: party.detailedAccount?.code || party.partyId.toString(),
              title: `${party.firstName || ''} ${party.lastName || ''}`.trim(),
              currencyName: currency?.title || '-',
              deposits: 0,
              withdrawals: 0
            });
          }
          partyData.get(key)!.withdrawals += Number(pc.amount || 0);
        }
      }

      if (filterType === 'promissory' || filterType === 'all') {
        const { ReceiptReturnedPaymentPromissoryNote } = await import('../../domain/entities/receipt-returned-payment-promissory-note.entity');
        const { PaymentPromissoryNote } = await import('../../domain/entities/payment-promissory-note.entity');
        
        const rpRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaymentPromissoryNote);
        const ppnRepo = this.cashRepository.manager.getRepository(PaymentPromissoryNote);

        const rpQuery = rpRepo.createQueryBuilder('rp')
          .innerJoinAndSelect('rp.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.party', 'party')
          .leftJoinAndSelect('rn.currency', 'currency')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
  if (currId === 0) rpQuery.andWhere('rn.currencyRef IS NULL');
  else rpQuery.andWhere('rn.currencyRef = :currId', { currId });
}
        if (finalFromDate) rpQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) rpQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

        const rpList = await rpQuery.getMany();
        for (const rp of rpList) {
          const party = rp.receiptNotification?.party;
          if (!party) continue;
          const currency = rp.receiptNotification?.currency;
          const cId = currency ? Number(currency.currencyID) : 0;
          const key = getPartyKey(Number(party.partyId), cId);
          if (!partyData.has(key)) {
            partyData.set(key, {
              code: party.detailedAccount?.code || party.partyId.toString(),
              title: `${party.firstName || ''} ${party.lastName || ''}`.trim(),
              currencyName: currency?.title || '-',
              deposits: 0,
              withdrawals: 0
            });
          }
          partyData.get(key)!.deposits += Number(rp.amount || 0);
        }

        const ppQuery = ppnRepo.createQueryBuilder('pp')
          .innerJoinAndSelect('pp.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.party', 'party')
          .leftJoinAndSelect('pn.currency', 'currency')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
  if (currId === 0) ppQuery.andWhere('pn.currencyRef IS NULL');
  else ppQuery.andWhere('pn.currencyRef = :currId', { currId });
}
        if (finalFromDate) ppQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) ppQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const ppList = await ppQuery.getMany();
        
        const clearedPromissoryQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
          .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
          .where('pdc.companyRef = :compId', { compId })
          .andWhere('pdc.businessStructureRef = :bsId', { bsId })
          .andWhere('item.documentType = :docType', { docType: 'promissory_note' });
        
        if (finalFromDate) clearedPromissoryQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
        if (finalToDate) clearedPromissoryQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });
        
        const clearedPromissory = await clearedPromissoryQuery.getMany();
        const clearedPromissoryIds = new Set(clearedPromissory.map(c => Number(c.documentId)));

        for (const pp of ppList) {
          const party = pp.paymentNotification?.party;
          if (!party) continue;
          
          if (clearedPromissoryIds.has(Number(pp.paymentPromissoryNoteId))) continue;

          const currency = pp.paymentNotification?.currency;
          const cId = currency ? Number(currency.currencyID) : 0;
          const key = getPartyKey(Number(party.partyId), cId);
          if (!partyData.has(key)) {
            partyData.set(key, {
              code: party.detailedAccount?.code || party.partyId.toString(),
              title: `${party.firstName || ''} ${party.lastName || ''}`.trim(),
              currencyName: currency?.title || '-',
              deposits: 0,
              withdrawals: 0
            });
          }
          partyData.get(key)!.withdrawals += Number(pp.amount || 0);
        }
      }

      const reportData = Array.from(partyData.entries()).map(([key, data]) => {
        const partyId = key.split('_')[0];
        return {
          id: `party_${key}`,
          code: data.code,
          title: data.title,
          deposits: data.deposits,
          withdrawals: data.withdrawals,
          balance: data.deposits - data.withdrawals,
          balanceType: (data.deposits - data.withdrawals) >= 0 ? 'بدهکار' : 'بستانکار',
          currencyName: data.currencyName
        };
      });

      return {
        success: true,
        reportData,
        horizontalConfig: { 
          payment_promissory_note: true, 
          detailedType_1: true, 
          detailedType_5: true, 
          detailedType_6: true, 
          accounting_operation: true, 
          reason: true, 
          currency: true 
        }
      };
    }

    if (verticalType === 'payment_promissory_note' && horizontalType === 'accounting_operation') {
      let currId: number | null = null;
      let filterType: 'cheque' | 'promissory' | 'all' = 'all';

      if (verticalValue === 'cheque') {
        filterType = 'cheque';
      } else if (verticalValue === 'promissory') {
        filterType = 'promissory';
      } else if (verticalValue && verticalValue.startsWith('cheque_')) {
        filterType = 'cheque';
        currId = Number(verticalValue.split('_')[1]);
      } else if (verticalValue && verticalValue.startsWith('promissory_')) {
        filterType = 'promissory';
        currId = Number(verticalValue.split('_')[1]);
      }

      const operationData = new Map<string, {
        code: string;
        title: string;
        currencyName: string;
        deposits: number;
        withdrawals: number;
      }>();

      const getOperationKey = (opId: number, currId: number) => `${opId}_${currId}`;

      if (filterType === 'cheque' || filterType === 'all') {
        const { ReceiptReturnedPaidCheque } = await import('../../domain/entities/receipt-returned-paid-cheque.entity');
        const { PaymentCheque } = await import('../../domain/entities/payment-cheque.entity');
        
        const rcRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaidCheque);
        const pcRepo = this.cashRepository.manager.getRepository(PaymentCheque);

        const rcQuery = rcRepo.createQueryBuilder('rc')
          .innerJoinAndSelect('rc.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.currency', 'currency')
          .leftJoinAndSelect('rc.accountingSetting', 'accountingSetting')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
  if (currId === 0) rcQuery.andWhere('rn.currencyRef IS NULL');
  else rcQuery.andWhere('rn.currencyRef = :currId', { currId });
}
        if (finalFromDate) rcQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) rcQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

        const rcList = await rcQuery.getMany();
        for (const rc of rcList) {
          const accSetting = rc.accountingSetting;
          if (!accSetting) continue;
          const currency = rc.receiptNotification?.currency;
          const cId = currency ? Number(currency.currencyID) : 0;
          const key = getOperationKey(Number(accSetting.recieptAndPaymentAccountingSettingId), cId);
          if (!operationData.has(key)) {
            operationData.set(key, {
              code: accSetting.code || accSetting.recieptAndPaymentAccountingSettingId.toString(),
              title: accSetting.title || '-',
              currencyName: currency?.title || '-',
              deposits: 0,
              withdrawals: 0
            });
          }
          operationData.get(key)!.deposits += Number(rc.amount || 0);
        }

        const pcQuery = pcRepo.createQueryBuilder('pc')
          .innerJoinAndSelect('pc.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.currency', 'currency')
          .leftJoinAndSelect('pc.accountingSetting', 'accountingSetting')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
  if (currId === 0) pcQuery.andWhere('pn.currencyRef IS NULL');
  else pcQuery.andWhere('pn.currencyRef = :currId', { currId });
}
        if (finalFromDate) pcQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) pcQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const pcList = await pcQuery.getMany();
        
        const clearedChequesQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
          .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
          .where('pdc.companyRef = :compId', { compId })
          .andWhere('pdc.businessStructureRef = :bsId', { bsId })
          .andWhere('item.documentType = :docType', { docType: 'cheque' });
        
        if (finalFromDate) clearedChequesQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
        if (finalToDate) clearedChequesQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });
        
        const clearedCheques = await clearedChequesQuery.getMany();
        const clearedChequeIds = new Set(clearedCheques.map(c => Number(c.documentId)));

        for (const pc of pcList) {
          const accSetting = pc.accountingSetting;
          if (!accSetting) continue;
          
          if (clearedChequeIds.has(Number(pc.paymentChequeId))) continue;

          const currency = pc.paymentNotification?.currency;
          const cId = currency ? Number(currency.currencyID) : 0;
          const key = getOperationKey(Number(accSetting.recieptAndPaymentAccountingSettingId), cId);
          if (!operationData.has(key)) {
            operationData.set(key, {
              code: accSetting.code || accSetting.recieptAndPaymentAccountingSettingId.toString(),
              title: accSetting.title || '-',
              currencyName: currency?.title || '-',
              deposits: 0,
              withdrawals: 0
            });
          }
          operationData.get(key)!.withdrawals += Number(pc.amount || 0);
        }
      }

      if (filterType === 'promissory' || filterType === 'all') {
        const { ReceiptReturnedPaymentPromissoryNote } = await import('../../domain/entities/receipt-returned-payment-promissory-note.entity');
        const { PaymentPromissoryNote } = await import('../../domain/entities/payment-promissory-note.entity');
        
        const rpRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaymentPromissoryNote);
        const ppnRepo = this.cashRepository.manager.getRepository(PaymentPromissoryNote);

        const rpQuery = rpRepo.createQueryBuilder('rp')
          .innerJoinAndSelect('rp.receiptNotification', 'rn')
          .leftJoinAndSelect('rn.currency', 'currency')
          .leftJoinAndSelect('rp.accountingSetting', 'accountingSetting')
          .where('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
  if (currId === 0) rpQuery.andWhere('rn.currencyRef IS NULL');
  else rpQuery.andWhere('rn.currencyRef = :currId', { currId });
}
        if (finalFromDate) rpQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) rpQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

        const rpList = await rpQuery.getMany();
        for (const rp of rpList) {
          const accSetting = rp.accountingSetting;
          if (!accSetting) continue;
          const currency = rp.receiptNotification?.currency;
          const cId = currency ? Number(currency.currencyID) : 0;
          const key = getOperationKey(Number(accSetting.recieptAndPaymentAccountingSettingId), cId);
          if (!operationData.has(key)) {
            operationData.set(key, {
              code: accSetting.code || accSetting.recieptAndPaymentAccountingSettingId.toString(),
              title: accSetting.title || '-',
              currencyName: currency?.title || '-',
              deposits: 0,
              withdrawals: 0
            });
          }
          operationData.get(key)!.deposits += Number(rp.amount || 0);
        }

        const ppQuery = ppnRepo.createQueryBuilder('pp')
          .innerJoinAndSelect('pp.paymentNotification', 'pn')
          .leftJoinAndSelect('pn.currency', 'currency')
          .leftJoinAndSelect('pp.accountingSetting', 'accountingSetting')
          .where('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId });

        if (currId !== null) {
  if (currId === 0) ppQuery.andWhere('pn.currencyRef IS NULL');
  else ppQuery.andWhere('pn.currencyRef = :currId', { currId });
}
        if (finalFromDate) ppQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
        if (finalToDate) ppQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

        const ppList = await ppQuery.getMany();
        
        const clearedPromissoryQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
          .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
          .where('pdc.companyRef = :compId', { compId })
          .andWhere('pdc.businessStructureRef = :bsId', { bsId })
          .andWhere('item.documentType = :docType', { docType: 'promissory_note' });
        
        if (finalFromDate) clearedPromissoryQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
        if (finalToDate) clearedPromissoryQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });
        
        const clearedPromissory = await clearedPromissoryQuery.getMany();
        const clearedPromissoryIds = new Set(clearedPromissory.map(c => Number(c.documentId)));

        for (const pp of ppList) {
          const accSetting = pp.accountingSetting;
          if (!accSetting) continue;
          
          if (clearedPromissoryIds.has(Number(pp.paymentPromissoryNoteId))) continue;

          const currency = pp.paymentNotification?.currency;
          const cId = currency ? Number(currency.currencyID) : 0;
          const key = getOperationKey(Number(accSetting.recieptAndPaymentAccountingSettingId), cId);
          if (!operationData.has(key)) {
            operationData.set(key, {
              code: accSetting.code || accSetting.recieptAndPaymentAccountingSettingId.toString(),
              title: accSetting.title || '-',
              currencyName: currency?.title || '-',
              deposits: 0,
              withdrawals: 0
            });
          }
          operationData.get(key)!.withdrawals += Number(pp.amount || 0);
        }
      }

      const reportData = Array.from(operationData.entries()).map(([key, data]) => {
        return {
          id: `op_${key}`,
          code: data.code,
          title: data.title,
          deposits: data.deposits,
          withdrawals: data.withdrawals,
          balance: data.deposits - data.withdrawals,
          balanceType: (data.deposits - data.withdrawals) >= 0 ? 'بدهکار' : 'بستانکار',
          currencyName: data.currencyName
        };
      });

      console.log('DEBUG: operationData size=', operationData.size, 'reportData.length=', reportData.length);

      return {
        success: true,
        reportData,
        horizontalConfig: { 
          payment_promissory_note: true, 
          detailedType_1: true, 
          detailedType_5: true, 
          detailedType_6: true, 
          accounting_operation: true, 
          reason: true, 
          currency: true 
        }
      };
    }

    if (verticalType === 'bank_account' && horizontalType === 'petty_cash') {
      const isShared = await this.isBasicInfoShared(bsId);

      const pettyCashesQuery = this.pettyCashRepository
        .createQueryBuilder('pc')
        .leftJoinAndSelect('pc.party', 'party')
        .leftJoinAndSelect('pc.currency', 'currency')
        .where('pc.isActive = :isActive', { isActive: true });

      if (isShared) {
        pettyCashesQuery.andWhere('pc.businessStructureRef = :bsId', { bsId });
      } else {
        pettyCashesQuery.andWhere('pc.companyRef = :compId', { compId });
      }

      const pettyCashes = await pettyCashesQuery.getMany();

      const depositQuery = this.receiptDepositRepository.createQueryBuilder('di')
        .innerJoin('di.receiptNotification', 'rn')
        .select(['rn.partyRef AS "partyRef"', 'di.amount AS "amount"'])
        .where('rn.receiptType = :receiptType', { receiptType: 'تسویه تنخواه' })
        .andWhere('di.bankAccountRef = :bankId', { bankId: Number(verticalValue) })
        .andWhere('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

      const bankReceiptList = await depositQuery.getRawMany();

      const withdrawalQuery = this.paymentWithdrawalRepository.createQueryBuilder('wi')
        .innerJoin('wi.paymentNotification', 'pn')
        .select(['pn.partyRef AS "partyRef"', 'wi.amount AS "amount"'])
        .where('pn.paymentType = :paymentType', { paymentType: 2 })
        .andWhere('wi.bankAccountRef = :bankId', { bankId: Number(verticalValue) })
        .andWhere('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

      const bankPaymentList = await withdrawalQuery.getRawMany();

      const reportData: any[] = [];
      const addedIds = new Set<number>();

      for (const pc of pettyCashes) {
        if (!pc.party) continue;
        if (addedIds.has(pc.pettyCashId)) continue;
        addedIds.add(pc.pettyCashId);

        let deposits = 0;
        let withdrawals = 0;

        const relevantReceipts = bankReceiptList.filter(rn => Number(rn.partyRef) === Number(pc.partyRef));
        for (const item of relevantReceipts) {
          deposits += Number(item.amount || 0);
        }

        const relevantPayments = bankPaymentList.filter(pn => Number(pn.partyRef) === Number(pc.partyRef));
        for (const item of relevantPayments) {
          withdrawals += Number(item.amount || 0);
        }

        // if (deposits === 0 && withdrawals === 0) continue;

        const partyName = pc.party ? `${pc.party.firstName || ''} ${pc.party.lastName || ''}`.trim() : '';

        reportData.push({
          id: pc.pettyCashId,
          code: pc.party?.detailedAccount?.code || '',
          title: partyName || pc.title,
          pettyCashName: pc.title,
          deposits,
          withdrawals,
          balance: deposits - withdrawals,
          currencyName: pc.currency?.title || '-',
        });
      }

      return {
        success: true,
        reportData,
        horizontalConfig: { detailedType_5: true, detailedType_1: true, accounting_operation: true, reason: true },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'petty_cash' && horizontalType === 'petty_cash') {
      const isShared = await this.isBasicInfoShared(bsId);

      const pettyCashesQuery = this.pettyCashRepository
        .createQueryBuilder('pc')
        .leftJoinAndSelect('pc.party', 'party')
        .leftJoinAndSelect('party.detailedAccount', 'detailedAccount')
        .leftJoinAndSelect('pc.currency', 'currency')
        .where('pc.isActive = :isActive', { isActive: true });

      if (isShared) {
        pettyCashesQuery.andWhere('pc.businessStructureRef = :bsId', { bsId });
      } else {
        pettyCashesQuery.andWhere('pc.companyRef = :compId', { compId });
      }

      const pettyCashes = await pettyCashesQuery.getMany();

      const paymentQuery = this.receiptDepositRepository.createQueryBuilder('di')
        .innerJoin('di.receiptNotification', 'rn')
        .select(['rn.partyRef AS "partyRef"', 'di.amount AS "amount"'])
        .where('rn.receiptType = :receiptType', { receiptType: 'تسویه تنخواه' })
        .andWhere('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) paymentQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) paymentQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });

      const allPaymentList = await paymentQuery.getRawMany();

      const receiptQuery = this.paymentWithdrawalRepository.createQueryBuilder('wi')
        .innerJoin('wi.paymentNotification', 'pn')
        .select(['pn.partyRef AS "partyRef"', 'wi.amount AS "amount"'])
        .where('pn.paymentType = :paymentType', { paymentType: 2 })
        .andWhere('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) receiptQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) receiptQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

      const allReceiptList = await receiptQuery.getRawMany();

      const reportData: any[] = [];
      const addedIds = new Set<number>();

      for (const pc of pettyCashes) {
        if (!pc.party) continue;
        if (addedIds.has(pc.pettyCashId)) continue;
        addedIds.add(pc.pettyCashId);

        let deposits = 0; 
        let withdrawals = 0;

        const relevantReceipts = allReceiptList.filter(pn => Number(pn.partyRef) === Number(pc.partyRef));
        for (const item of relevantReceipts) {
          deposits += Number(item.amount || 0);
        }

        const relevantPayments = allPaymentList.filter(rn => Number(rn.partyRef) === Number(pc.partyRef));
        for (const item of relevantPayments) {
          withdrawals += Number(item.amount || 0);
        }

        const partyName = pc.party ? `${pc.party.firstName || ''} ${pc.party.lastName || ''}`.trim() : '';

        reportData.push({
          id: pc.pettyCashId.toString(),
          code: pc.party?.detailedAccount?.code || '',
          title: partyName || pc.title,
          pettyCashName: partyName || pc.title,
          deposits,
          withdrawals,
          balance: deposits - withdrawals,
          balanceType: (deposits - withdrawals) >= 0 ? 'بدهکار' : 'بستانکار',
          currencyName: pc.currency?.title || '-',
        });
      }

      return {
        success: true,
        reportData,
        horizontalConfig: { detailedType_5: true, detailedType_1: true, accounting_operation: true, reason: true },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'bank_account' && horizontalType === 'cash') {
      // 1. Check basic info sharing setting (Rule 1)
      const isShared = await this.isBasicInfoShared(bsId);

      // 2. Get active cashes based on sharing rule
      const cashesQuery = this.cashRepository
        .createQueryBuilder('ba')
        .leftJoinAndSelect('ba.detailedAccount', 'da')
        .where('ba.isActive = :isActive', { isActive: true });

      if (isShared) {
        cashesQuery.andWhere('ba.businessStructureRef = :bsId', { bsId });
      } else {
        cashesQuery.andWhere('ba.companyRef = :compId', { compId });
      }

      const cashes = await cashesQuery.getMany();

      // 3. Deposits: Cash to Bank (صندوق به بانک) from ReceiptNotification where receiptType === 'صندوق به بانک'
      const cashToBankReceiptQuery = this.receiptCashRepository
        .createQueryBuilder('rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.currency', 'currency')
        .innerJoinAndSelect('rn.depositItems', 'di')
        .where('rn.receiptType = :receiptType', { receiptType: 'صندوق به بانک' })
        .andWhere('di.bankAccountRef = :bankId', { bankId: Number(verticalValue) })
        .andWhere('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        cashToBankReceiptQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        cashToBankReceiptQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const cashToBankReceiptList = await cashToBankReceiptQuery.getMany();

      // 4. Withdrawals: Bank to Cash (بانک به صندوق) from PaymentNotification where paymentType === 4
      const bankToCashPaymentQuery = this.paymentWithdrawalRepository
        .createQueryBuilder('wi')
        .innerJoinAndSelect('wi.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.paymentType = :paymentType', { paymentType: 4 })
        .andWhere('wi.bankAccountRef = :bankId', { bankId: Number(verticalValue) })
        .andWhere('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        bankToCashPaymentQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        bankToCashPaymentQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const bankToCashPaymentList = await bankToCashPaymentQuery.getMany();

      // 5. Map Cashes into reportData
      const reportData = cashes.map(cash => {
        // Deposits (واریز): Cash to Bank (صندوق به بانک) from ReceiptNotification
        const totalDeposits = cashToBankReceiptList
          .filter(rc => Number(rc.cashRef) === Number(cash.cashId))
          .reduce((sum, rc) => sum + Number(rc.amount || 0), 0);

        // Withdrawals (برداشت): Bank to Cash (بانک به صندوق) from PaymentNotification
        const totalWithdrawals = bankToCashPaymentList
          .filter(wi => Number(wi.paymentNotification?.partyRef) === Number(cash.cashId))
          .reduce((sum, wi) => sum + Number(wi.amount || 0), 0);

        const balance = totalDeposits - totalWithdrawals;

        // Determine currency type
        const currencyName = cashToBankReceiptList.find(rc => Number(rc.cashRef) === Number(cash.cashId))?.receiptNotification?.currency?.title ||
                             bankToCashPaymentList.find(wi => Number(wi.paymentNotification?.partyRef) === Number(cash.cashId))?.paymentNotification?.currency?.title ||
                             cash.currency?.title ||
                             'ریال';

        return {
          id: cash.cashId.toString(),
          code: cash.detailedAccount?.code || cash.code || '',
          title: cash.title || '',
          deposits: totalDeposits,
          withdrawals: totalWithdrawals,
          balance,
          balanceType: balance >= 0 ? 'بدهکار' : 'بستانکار',
          currencyName,
        };
      }).filter(x => x.deposits !== 0 || x.withdrawals !== 0);

      return {
        success: true,
        reportData,
        horizontalConfig: { detailedType_2: true, detailedType_1: true, accounting_operation: true, reason: true },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'bank_account' && horizontalType === 'bank_account') {
      // Check basic info sharing setting (Rule 1)
      const isShared = await this.isBasicInfoShared(bsId);

      // Get active bank accounts based on sharing rule
      const bankAccountsQuery = this.bankAccountRepository
        .createQueryBuilder('ba')
        .where('ba.isActive = :isActive', { isActive: true });

      if (isShared) {
        bankAccountsQuery.andWhere('ba.businessStructureRef = :bsId', { bsId });
      } else {
        bankAccountsQuery.andWhere('ba.companyRef = :compId', { compId });
      }

      const bankAccounts = await bankAccountsQuery.getMany();

      // Get all deposits from receipt notifications (within optional date filter)
      const depositQuery = this.receiptDepositRepository
        .createQueryBuilder('deposit')
        .innerJoinAndSelect('deposit.receiptNotification', 'rn')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const depositsList = await depositQuery.getMany();

      // Get all withdrawals from payment notifications (within optional date filter)
      const withdrawalQuery = this.paymentWithdrawalRepository
        .createQueryBuilder('withdrawal')
        .innerJoinAndSelect('withdrawal.paymentNotification', 'pn')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const withdrawalsList = await withdrawalQuery.getMany();

      // Fetch PaymentCheques for the bank accounts
      const paymentChequeQuery = this.paymentChequeRepository
        .createQueryBuilder('pc')
        .innerJoinAndSelect('pc.paymentNotification', 'pn')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });
        
      if (finalFromDate) {
        paymentChequeQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        paymentChequeQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }
      
      const paymentChequesList = await paymentChequeQuery.getMany();
      
      // Fetch PaidDocumentClearingItems for cheques
      const clearingQuery = this.paidDocumentClearingItemRepository
        .createQueryBuilder('item')
        .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
        .where('pdc.companyRef = :compId', { compId })
        .andWhere('pdc.businessStructureRef = :bsId', { bsId })
        .andWhere('item.documentType = :docType', { docType: 'cheque' });

      if (finalFromDate) {
        clearingQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        clearingQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });
      }
      
      const clearingItemsList = await clearingQuery.getMany();
      const clearedChequeIds = new Set(clearingItemsList.map(item => Number(item.documentId)));

      // Get all ReceivedChequeOperationItem for the current company and business structure
      const chequeOpItems = await this.receivedChequeOperationItemRepository
        .createQueryBuilder('item')
        .innerJoinAndSelect('item.operation', 'op')
        .innerJoinAndSelect('item.receiptCheque', 'cheque')
        .where('op.companyRef = :compId', { compId })
        .andWhere('op.businessStructureRef = :bsId', { bsId })
        .getMany();

      // Group operations by cheque ID
      const chequeOpsMap = new Map<number, any[]>();
      for (const item of chequeOpItems) {
        const chequeId = Number(item.receiptChequeRef);
        if (!chequeOpsMap.has(chequeId)) {
          chequeOpsMap.set(chequeId, []);
        }
        chequeOpsMap.get(chequeId)!.push(item);
      }

      const reportData = bankAccounts.map(ba => {
        const initialBalance = Number(ba.initialBalance || 0);

        // Sum deposits for this bank account
        const deposits = depositsList
          .filter(d => Number(d.bankAccountRef) === Number(ba.bankAccountId))
          .reduce((sum, d) => sum + Number(d.amount || 0), 0);

        // Sum withdrawals for this bank account
        const withdrawals = withdrawalsList
          .filter(w => Number(w.bankAccountRef) === Number(ba.bankAccountId))
          .reduce((sum, w) => sum + Number(w.amount || 0), 0);

        const balance = initialBalance + deposits - withdrawals;

        // Sum cheques belonging to this bank account
        let chequesInCollection = 0;
        let bouncedCheques = 0;

        for (const [chequeId, items] of chequeOpsMap.entries()) {
          // Find if there is an assignment (operationType = 1) to this bank account
          const assignment = items.find(item => item.operation?.operationType === 1 && Number(item.operation?.bankAccountRef) === Number(ba.bankAccountId));
          
          if (assignment) {
            const chequeAmount = Number(assignment.receiptCheque?.amount || 0);

            // Check if there is a subsequent collection/protest with "Collected" status
            const isCollected = items.some(item => 
              item.operation?.operationType === 3 || 
              (item.operation?.operationType === 2 && item.chequeStatus === 1)
            );

            // Check if there is a protest with "Protested" status
            const isProtested = items.some(item => 
              item.operation?.operationType === 2 && item.chequeStatus === 2
            );

            // Check if there is a return operation
            const isReturned = items.some(item => 
              item.operation?.operationType === 4
            );

            if (!isCollected && !isProtested && !isReturned) {
              chequesInCollection += chequeAmount;
            } else if (isProtested && !isCollected && !isReturned) {
              bouncedCheques += chequeAmount;
            }
          }
        }

        const payableCheques = paymentChequesList
          .filter(pc => Number(pc.bankAccountRef) === Number(ba.bankAccountId) && !clearedChequeIds.has(Number(pc.paymentChequeId)))
          .reduce((sum, pc) => sum + Number(pc.amount || 0), 0);

        return {
          id: ba.bankAccountId.toString(),
          code: ba.detailedCode?.toString() || '',
          title: ba.title || '',
          initialBalance,
          deposits,
          withdrawals,
          balance,
          balanceType: balance >= 0 ? 'بدهکار' : 'بستانکار',
          chequesInCollection,
          bouncedCheques,
          payableCheques,
        };
      }).filter(x => x.initialBalance !== 0 || x.deposits !== 0 || x.withdrawals !== 0 || x.chequesInCollection !== 0 || x.bouncedCheques !== 0);

      let hasCashFlow = true;
      let hasPettyCashFlow = true;
      let hasPaymentCheques = true;
      let hasAssignedToBank = true;
      let hasProtested = true;

      if (verticalValue && verticalValue !== 'all' && !isNaN(Number(verticalValue))) {
        const bankId = Number(verticalValue);
        
        const cashToBankReceiptCount = await this.receiptCashRepository
          .createQueryBuilder('rc')
          .innerJoin('rc.receiptNotification', 'rn')
          .innerJoin('rn.depositItems', 'di')
          .where('rn.receiptType = :receiptType', { receiptType: 'صندوق به بانک' })
          .andWhere('di.bankAccountRef = :bankId', { bankId })
          .andWhere('rn.companyRef = :compId', { compId })
          .andWhere('rn.businessStructureRef = :bsId', { bsId })
          .getCount();

        const bankToCashPaymentCount = await this.paymentWithdrawalRepository
          .createQueryBuilder('wi')
          .innerJoin('wi.paymentNotification', 'pn')
          .where('pn.paymentType = :paymentType', { paymentType: 4 })
          .andWhere('wi.bankAccountRef = :bankId', { bankId })
          .andWhere('pn.companyRef = :compId', { compId })
          .andWhere('pn.businessStructureRef = :bsId', { bsId })
          .getCount();

        hasCashFlow = cashToBankReceiptCount > 0 || bankToCashPaymentCount > 0;

        const pettyCashToBankRows = await this.bankAccountRepository.query(`
          SELECT count(1) as cnt
          FROM "Rap"."ReceiptNotifications" rn
          INNER JOIN "Rap"."ReceiptDeposit" di ON di."ReceiptNotificationRef" = rn."ReceiptNotificationID"
          WHERE rn."ReceiptType" = 'تسویه تنخواه' AND di."BankAccountRef" = $1 AND rn."CompanyRef" = $2 AND rn."BusinessStructureRef" = $3
        `, [bankId, compId, bsId]);
        const pettyCashToBankCount = Number(pettyCashToBankRows[0]?.cnt || 0);

        const bankToPettyCashRows = await this.bankAccountRepository.query(`
          SELECT count(1) as cnt
          FROM "Rap"."PaymentNotifications" pn
          INNER JOIN "Rap"."PaymentWithdrawal" wi ON wi."PaymentNotificationRef" = pn."PaymentNotificationID"
          WHERE pn."PaymentType" = 2 AND wi."BankAccountRef" = $1 AND pn."CompanyRef" = $2 AND pn."BusinessStructureRef" = $3
        `, [bankId, compId, bsId]);
        const bankToPettyCashCount = Number(bankToPettyCashRows[0]?.cnt || 0);

        hasPettyCashFlow = pettyCashToBankCount > 0 || bankToPettyCashCount > 0;

        hasPaymentCheques = paymentChequesList.some(pc => Number(pc.bankAccountRef) === bankId);

        let assigned = false;
        let protested = false;
        
        for (const [chequeId, items] of chequeOpsMap.entries()) {
          const assignment = items.find(item => item.operation?.operationType === 1 && Number(item.operation?.bankAccountRef) === bankId);
          if (assignment) {
            assigned = true;
            const isProtested = items.some(item => item.operation?.operationType === 2 && item.chequeStatus === 2);
            if (isProtested) {
              protested = true;
            }
          }
        }
        
        hasAssignedToBank = assigned;
        hasProtested = protested;
      }

      const horizontalConfig = { 
        detailedType_1: true, 
        detailedType_2: hasCashFlow,
        detailedType_5: hasPettyCashFlow,
        payment_promissory_note: hasPaymentCheques,
        receipt_promissory_note: hasAssignedToBank,
        assigned_to_bank: hasAssignedToBank,
        protested: hasProtested,
        detailedType_6: true,
        accounting_operation: true,
        reason: true,
        currency: true
      };

      return {
        success: true,
        reportData,
        horizontalConfig,
        rawItemsForTableWithKeys: []
      };
    }


    if (verticalType === 'petty_cash' && (horizontalType === 'accounting_operation' || horizontalType === 'reason')) {
      const isAccounting = horizontalType === 'accounting_operation';
      const pettyCashId = Number(verticalValue);
      const reportData: any[] = [];
      
      if (!isAccounting) {
        let queryStr = `SELECT i."ReasonRef", r."Title" as reason_title, r."Code" as reason_code, pc."CurrencyID", c."Title" as currency_title, SUM(i."Amount") as withdrawals
           FROM "Rap"."PettyCashSummaries" pcs
           INNER JOIN "Rap"."PettyCashSummaryItems" i ON i."PettyCashSummaryRef" = pcs."pettyCashSummaryId"
           LEFT JOIN "Rap"."Reasons" r ON r."RapReasonID" = i."ReasonRef"
           INNER JOIN "Rap"."PettyCashes" pc ON pc."PettyCashID" = pcs."PettyCashRef"
           LEFT JOIN "Gnr"."Currency" c ON c."CurrencyID" = pc."CurrencyID"
           WHERE pcs."CompanyRef" = $1 AND pcs."BusinessStructureRef" = $2 AND pcs."PettyCashRef" = $3`;
        
        const params: any[] = [compId, bsId, pettyCashId];
        
        if (finalFromDate) {
          params.push(finalFromDate);
          queryStr += ` AND pcs."Date" >= $${params.length}`;
        }
        if (finalToDate) {
          params.push(finalToDate);
          queryStr += ` AND pcs."Date" <= $${params.length}`;
        }
        
        queryStr += ` GROUP BY i."ReasonRef", r."Title", r."Code", pc."CurrencyID", c."Title"`;

        const summariesRows = await this.pettyCashRepository.query(queryStr, params);
        
        for (const row of summariesRows) {
          reportData.push({
            id: (row.ReasonRef || 0).toString(),
            title: row.reason_title || 'نامشخص',
            code: row.reason_code || '-',
            deposits: 0,
            withdrawals: Number(row.withdrawals) || 0,
            balance: 0 - (Number(row.withdrawals) || 0),
            currencyName: row.currency_title || '-'
          });
        }
      } else {
        // isAccounting === true
        const pcRow = await this.pettyCashRepository.query(
          `SELECT "PartyRef", "CurrencyID" FROM "Rap"."PettyCashes" WHERE "PettyCashID" = $1`,
          [pettyCashId]
        );
        if (pcRow && pcRow.length > 0) {
          const partyId = pcRow[0].PartyRef;
          const currencyId = pcRow[0].CurrencyID;

          const currRow = await this.pettyCashRepository.query(
            `SELECT "Title" FROM "Gnr"."Currency" WHERE "CurrencyID" = $1`,
            [currencyId]
          );
          const currencyName = currRow && currRow.length > 0 ? currRow[0].Title : '-';

          // 1. Query deposits (Receipt Notifications) of type 'تسویه تنخواه' for this partyRef
          let depositQueryStr = `
            SELECT item."AccountingSettingRef" as "accountingSettingRef", SUM(item."Amount") as "amount"
            FROM (
              SELECT "AccountingSettingRef", "Amount", "ReceiptNotificationRef" FROM "Rap"."ReceiptDeposit"
              UNION ALL
              SELECT "AccountingSettingRef", "Amount", "ReceiptNotificationRef" FROM "Rap"."ReceiptCash"
              UNION ALL
              SELECT "AccountingSettingRef", "Amount", "ReceiptNotificationRef" FROM "Rap"."ReceiptCheque"
              UNION ALL
              SELECT "AccountingSettingRef", "Amount", "ReceiptNotificationRef" FROM "Rap"."ReceiptPromissoryNote"
            ) item
            INNER JOIN "Rap"."ReceiptNotifications" rn ON rn."ReceiptNotificationID" = item."ReceiptNotificationRef"
            WHERE rn."ReceiptType" = 'تسویه تنخواه'
              AND rn."PartyRef" = $1
              AND rn."CompanyRef" = $2
              AND rn."BusinessStructureRef" = $3
          `;
          const depositParams: any[] = [partyId, compId, bsId];
          if (finalFromDate) {
            depositParams.push(finalFromDate);
            depositQueryStr += ` AND rn."DocumentDate" >= $${depositParams.length}`;
          }
          if (finalToDate) {
            depositParams.push(finalToDate);
            depositQueryStr += ` AND rn."DocumentDate" <= $${depositParams.length}`;
          }
          depositQueryStr += ` GROUP BY item."AccountingSettingRef"`;

          const depositRows = await this.pettyCashRepository.query(depositQueryStr, depositParams);

          // 2. Query withdrawals (Payment Notifications) of type 'شارژ تنخواه' (paymentType = 2) for this partyRef
          let withdrawalQueryStr = `
            SELECT item."AccountingSettingRef" as "accountingSettingRef", SUM(item."Amount") as "amount"
            FROM (
              SELECT "AccountingSettingRef", "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentWithdrawal"
              UNION ALL
              SELECT "AccountingSettingRef", "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentCash"
              UNION ALL
              SELECT "AccountingSettingRef", "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentCheque"
              UNION ALL
              SELECT "AccountingSettingRef", "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentAssignment"
              UNION ALL
              SELECT "AccountingSettingRef", "Amount", "PaymentNotificationRef" FROM "Rap"."PaymentPromissoryNote"
            ) item
            INNER JOIN "Rap"."PaymentNotifications" pn ON pn."PaymentNotificationID" = item."PaymentNotificationRef"
            WHERE pn."PaymentType" = 2
              AND pn."PartyRef" = $1
              AND pn."CompanyRef" = $2
              AND pn."BusinessStructureRef" = $3
          `;
          const withdrawalParams: any[] = [partyId, compId, bsId];
          if (finalFromDate) {
            withdrawalParams.push(finalFromDate);
            withdrawalQueryStr += ` AND pn."DocumentDate" >= $${withdrawalParams.length}`;
          }
          if (finalToDate) {
            withdrawalParams.push(finalToDate);
            withdrawalQueryStr += ` AND pn."DocumentDate" <= $${withdrawalParams.length}`;
          }
          withdrawalQueryStr += ` GROUP BY item."AccountingSettingRef"`;

          const withdrawalRows = await this.pettyCashRepository.query(withdrawalQueryStr, withdrawalParams);

          // 3. Query total expenditures from summaries for unspecified withdrawals
          let summariesQueryStr = `
            SELECT SUM(i."Amount") as withdrawals
            FROM "Rap"."PettyCashSummaries" pcs
            INNER JOIN "Rap"."PettyCashSummaryItems" i ON i."PettyCashSummaryRef" = pcs."pettyCashSummaryId"
            WHERE pcs."CompanyRef" = $1 AND pcs."BusinessStructureRef" = $2 AND pcs."PettyCashRef" = $3
          `;
          const summariesParams: any[] = [compId, bsId, pettyCashId];
          if (finalFromDate) {
            summariesParams.push(finalFromDate);
            summariesQueryStr += ` AND pcs."Date" >= $${summariesParams.length}`;
          }
          if (finalToDate) {
            summariesParams.push(finalToDate);
            summariesQueryStr += ` AND pcs."Date" <= $${summariesParams.length}`;
          }

          const summariesRows = await this.pettyCashRepository.query(summariesQueryStr, summariesParams);
          const totalSummaryWithdrawals = Number(summariesRows[0]?.withdrawals || 0);

          // Map everything to grouped map by AccountingSettingRef
          const groupedMap = new Map<string, any>();

          // Get all accounting settings
          const settingsRows = await this.pettyCashRepository.query(
            `SELECT "RecieptAndPaymentAccountingSettingID" as id, "Code" as code, "Title" as title FROM "Rap"."RecieptAndPaymentAccountingSetting" WHERE "isActive" = true`
          );
          const settingsMap = new Map<string, { code: string; title: string }>();
          for (const s of settingsRows) {
            settingsMap.set(String(s.id), { code: s.code || '-', title: s.title || 'نامشخص' });
          }

          // Add summaries expenditures to unspecified
          if (totalSummaryWithdrawals > 0) {
            groupedMap.set('unspecified', {
              id: 'unspecified',
              title: 'نامشخص',
              code: '-',
              deposits: 0,
              withdrawals: totalSummaryWithdrawals,
              balance: -totalSummaryWithdrawals,
              currencyName
            });
          }

          // Process deposits
          for (const row of depositRows) {
            const key = row.accountingSettingRef ? String(row.accountingSettingRef) : 'unspecified';
            const setting = settingsMap.get(key) || { code: '-', title: 'نامشخص' };
            if (!groupedMap.has(key)) {
              groupedMap.set(key, {
                id: key,
                title: setting.title,
                code: setting.code,
                deposits: 0,
                withdrawals: 0,
                balance: 0,
                currencyName
              });
            }
            const g = groupedMap.get(key);
            g.deposits += Number(row.amount || 0);
            g.balance = g.deposits - g.withdrawals;
          }

          // Process withdrawals
          for (const row of withdrawalRows) {
            const key = row.accountingSettingRef ? String(row.accountingSettingRef) : 'unspecified';
            const setting = settingsMap.get(key) || { code: '-', title: 'نامشخص' };
            if (!groupedMap.has(key)) {
              groupedMap.set(key, {
                id: key,
                title: setting.title,
                code: setting.code,
                deposits: 0,
                withdrawals: 0,
                balance: 0,
                currencyName
              });
            }
            const g = groupedMap.get(key);
            g.withdrawals += Number(row.amount || 0);
            g.balance = g.deposits - g.withdrawals;
          }

          reportData.push(...Array.from(groupedMap.values()));
        }
      }

      return {
        success: true,
        reportData,
        horizontalConfig: { [horizontalType]: true },
        rawItemsForTableWithKeys: []
      };
    }

    if ((verticalType === 'bank_account' || verticalType === 'detailedType_1') && horizontalType === 'payment_promissory_note') {
      const bankAccountId = Number(verticalValue);
      const reportData: any[] = [];

      const { ReceiptReturnedPaidCheque } = await import('../../domain/entities/receipt-returned-paid-cheque.entity');
      const rcRepo = this.cashRepository.manager.getRepository(ReceiptReturnedPaidCheque);

      // 1. Deposits: Returned Paid Cheques
      const returnedChequesQuery = rcRepo.createQueryBuilder('rc')
        .innerJoinAndSelect('rc.paymentCheque', 'pc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rn.currency', 'currency')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere('pc.bankAccountRef = :bankAccountId', { bankAccountId });

      if (finalFromDate) returnedChequesQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) returnedChequesQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      
      const returnedCheques = await returnedChequesQuery.getMany();
      
      let chequeDeposits = 0;
      let currencyName = '-';
      for (const rc of returnedCheques) {
        chequeDeposits += Number(rc.amount || 0);
        if (rc.receiptNotification?.currency?.title) {
          currencyName = rc.receiptNotification.currency.title;
        }
      }

      // 2. Withdrawals: Payment Cheques
      const paymentChequesQuery = this.paymentChequeRepository.createQueryBuilder('pc')
        .innerJoinAndSelect('pc.paymentNotification', 'pn')
        .leftJoinAndSelect('pn.currency', 'currency')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('pc.bankAccountRef = :bankAccountId', { bankAccountId });

      if (finalFromDate) paymentChequesQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      if (finalToDate) paymentChequesQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });

      const paymentCheques = await paymentChequesQuery.getMany();
      
      // 3. Paid Document Clearing Items (cleared cheques)
      const clearedChequesQuery = this.paidDocumentClearingItemRepository.createQueryBuilder('item')
        .innerJoinAndSelect('item.paidDocumentClearing', 'pdc')
        .where('pdc.companyRef = :compId', { compId })
        .andWhere('pdc.businessStructureRef = :bsId', { bsId })
        .andWhere('item.documentType = :docType', { docType: 'cheque' });

      if (finalFromDate) clearedChequesQuery.andWhere('pdc.date >= :finalFromDate', { finalFromDate });
      if (finalToDate) clearedChequesQuery.andWhere('pdc.date <= :finalToDate', { finalToDate });

      const clearedItems = await clearedChequesQuery.getMany();
      const clearedChequeIds = new Set(clearedItems.map(item => Number(item.documentId)));

      let chequeWithdrawals = 0;
      for (const pc of paymentCheques) {
        if (!clearedChequeIds.has(Number(pc.paymentChequeId))) {
          chequeWithdrawals += Number(pc.amount || 0);
        }
        if (pc.paymentNotification?.currency?.title && currencyName === '-') {
          currencyName = pc.paymentNotification.currency.title;
        }
      }

      // Promissory notes: they are not linked to a bank account, so they are always 0.
      const promissoryDeposits = 0;
      const promissoryWithdrawals = 0;

      reportData.push({
        id: 'cheque',
        docType: 'چک',
        deposits: chequeDeposits,
        withdrawals: chequeWithdrawals,
        balance: chequeDeposits - chequeWithdrawals,
        currencyName
      });

      reportData.push({
        id: 'promissory',
        docType: 'سفته',
        deposits: promissoryDeposits,
        withdrawals: promissoryWithdrawals,
        balance: promissoryDeposits - promissoryWithdrawals,
        currencyName
      });

      return {
        success: true,
        reportData,
        horizontalConfig: { [horizontalType]: true },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'bank_account' && horizontalType === 'accounting_operation') {
      const bankAccountId = Number(verticalValue);
      
      const baRow = await this.pettyCashRepository.query(
        `SELECT "CurrencyRef" FROM "Rap"."BankAccounts" WHERE "BankAccountID" = $1`,
        [bankAccountId]
      );
      const currencyId = baRow && baRow.length > 0 ? baRow[0].CurrencyRef : null;
      let currencyName = '-';
      if (currencyId) {
        const currRow = await this.pettyCashRepository.query(
          `SELECT "Title" FROM "Gnr"."Currency" WHERE "CurrencyID" = $1`,
          [currencyId]
        );
        currencyName = currRow && currRow.length > 0 ? currRow[0].Title : '-';
      }

      // 1. Query deposits (Receipt Notifications) of type 'تسویه تنخواه' for this bank account
      let depositQueryStr = `
        SELECT di."AccountingSettingRef" as "accountingSettingRef", SUM(di."Amount") as "amount"
        FROM "Rap"."ReceiptDeposit" di
        INNER JOIN "Rap"."ReceiptNotifications" rn ON rn."ReceiptNotificationID" = di."ReceiptNotificationRef"
        WHERE rn."ReceiptType" = 'تسویه تنخواه'
          AND di."BankAccountRef" = $1
          AND rn."CompanyRef" = $2
          AND rn."BusinessStructureRef" = $3
      `;
      const depositParams: any[] = [bankAccountId, compId, bsId];
      if (finalFromDate) {
        depositParams.push(finalFromDate);
        depositQueryStr += ` AND rn."DocumentDate" >= $${depositParams.length}`;
      }
      if (finalToDate) {
        depositParams.push(finalToDate);
        depositQueryStr += ` AND rn."DocumentDate" <= $${depositParams.length}`;
      }
      depositQueryStr += ` GROUP BY di."AccountingSettingRef"`;

      const depositRows = await this.pettyCashRepository.query(depositQueryStr, depositParams);

      // 2. Query withdrawals (Payment Notifications) of type 'شارژ تنخواه' (paymentType = 2) for this bank account
      let withdrawalQueryStr = `
        SELECT wi."AccountingSettingRef" as "accountingSettingRef", SUM(wi."Amount") as "amount"
        FROM "Rap"."PaymentWithdrawal" wi
        INNER JOIN "Rap"."PaymentNotifications" pn ON pn."PaymentNotificationID" = wi."PaymentNotificationRef"
        WHERE pn."PaymentType" = 2
          AND wi."BankAccountRef" = $1
          AND pn."CompanyRef" = $2
          AND pn."BusinessStructureRef" = $3
      `;
      const withdrawalParams: any[] = [bankAccountId, compId, bsId];
      if (finalFromDate) {
        withdrawalParams.push(finalFromDate);
        withdrawalQueryStr += ` AND pn."DocumentDate" >= $${withdrawalParams.length}`;
      }
      if (finalToDate) {
        withdrawalParams.push(finalToDate);
        withdrawalQueryStr += ` AND pn."DocumentDate" <= $${withdrawalParams.length}`;
      }
      withdrawalQueryStr += ` GROUP BY wi."AccountingSettingRef"`;

      const withdrawalRows = await this.pettyCashRepository.query(withdrawalQueryStr, withdrawalParams);

      // Get all accounting settings
      const settingsRows = await this.pettyCashRepository.query(
        `SELECT "RecieptAndPaymentAccountingSettingID" as id, "Code" as code, "Title" as title FROM "Rap"."RecieptAndPaymentAccountingSetting" WHERE "isActive" = true`
      );
      const settingsMap = new Map<string, { code: string; title: string }>();
      for (const s of settingsRows) {
        settingsMap.set(String(s.id), { code: s.code || '-', title: s.title || 'نامشخص' });
      }

      const groupedMap = new Map<string, any>();

      // Process deposits
      for (const row of depositRows) {
        const key = row.accountingSettingRef ? String(row.accountingSettingRef) : 'unspecified';
        const setting = settingsMap.get(key) || { code: '-', title: 'نامشخص' };
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            id: key,
            title: setting.title,
            code: setting.code,
            deposits: 0,
            withdrawals: 0,
            balance: 0,
            currencyName
          });
        }
        const g = groupedMap.get(key);
        g.deposits += Number(row.amount || 0);
        g.balance = g.deposits - g.withdrawals;
      }

      // Process withdrawals
      for (const row of withdrawalRows) {
        const key = row.accountingSettingRef ? String(row.accountingSettingRef) : 'unspecified';
        const setting = settingsMap.get(key) || { code: '-', title: 'نامشخص' };
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            id: key,
            title: setting.title,
            code: setting.code,
            deposits: 0,
            withdrawals: 0,
            balance: 0,
            currencyName
          });
        }
        const g = groupedMap.get(key);
        g.withdrawals += Number(row.amount || 0);
        g.balance = g.deposits - g.withdrawals;
      }

      const reportData = Array.from(groupedMap.values());

      return {
        success: true,
        reportData,
        horizontalConfig: { 
          accounting_operation: true, 
          reason: true, 
          detailedType_2: true, 
          detailedType_5: true,
          cash: true,
          detailedType_1: true
        },
        rawItemsForTableWithKeys: []
      };
    }

    if ((verticalType === 'cash' || (verticalType === 'bank_account' && horizontalType !== 'accounting_operation')) && (horizontalType === 'accounting_operation' || horizontalType === 'reason')) {
      const isAccounting = horizontalType === 'accounting_operation';
      const refField = isAccounting ? 'accountingSettingRef' : 'reasonRef';
      const relName = isAccounting ? 'accountingSetting' : 'reason';
      const accountId = Number(verticalValue);

      // 1- Deposits
      const depositQuery = verticalType === 'cash' ? this.receiptCashRepository.createQueryBuilder('rc') : this.receiptDepositRepository.createQueryBuilder('rc');
      
      depositQuery
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect(`rc.${relName}`, 'rel')
        .leftJoinAndSelect('rn.currency', 'curr')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere(verticalType === 'cash' ? 'rc.cashRef = :accountId' : 'rc.bankAccountRef = :accountId', { accountId });

      if (finalFromDate) {
        depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const depositsList = await depositQuery.getMany();

      // 2- Withdrawals
      const withdrawalQuery = verticalType === 'cash' ? this.paymentCashRepository.createQueryBuilder('pc') : this.paymentWithdrawalRepository.createQueryBuilder('pc');
      
      withdrawalQuery
        .innerJoinAndSelect('pc.paymentNotification', 'pn')
        .leftJoinAndSelect(`pc.${relName}`, 'rel')
        .leftJoinAndSelect('pn.currency', 'curr')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere(verticalType === 'cash' ? 'pc.cashRef = :accountId' : 'pc.bankAccountRef = :accountId', { accountId });

      if (finalFromDate) {
        withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const withdrawalsList = await withdrawalQuery.getMany();

      const groupedMap = new Map<number | string, any>();

      depositsList.forEach(item => {
        const key = item[refField] || 'empty';
        let title = 'نامشخص';
        let code = '-';
        if (item[relName]) {
          title = (item[relName] as any).title || (item[relName] as any).Title || title;
          code = (item[relName] as any).code || (item[relName] as any).Code || code;
        }
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { id: key, code, title, deposits: 0, withdrawals: 0, balance: 0, currencyName: item.receiptNotification?.currency?.title || '-' });
        }
        const g = groupedMap.get(key);
        g.deposits += Number(item.amount || 0);
        g.balance = g.deposits - g.withdrawals;
      });

      withdrawalsList.forEach(item => {
        const key = item[refField] || 'empty';
        let title = 'نامشخص';
        let code = '-';
        if (item[relName]) {
          title = (item[relName] as any).title || (item[relName] as any).Title || title;
          code = (item[relName] as any).code || (item[relName] as any).Code || code;
        }
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { id: key, code, title, deposits: 0, withdrawals: 0, balance: 0, currencyName: item.paymentNotification?.currency?.title || '-' });
        }
        const g = groupedMap.get(key);
        g.withdrawals += Number(item.amount || 0);
        g.balance = g.deposits - g.withdrawals;
      });

      const reportData = Array.from(groupedMap.values());

      return {
        success: true,
        reportData,
        horizontalConfig: { 
          accounting_operation: true, 
          reason: true, 
          detailedType_2: true, 
          detailedType_5: true,
          cash: verticalType === 'bank_account',
          bank_account: verticalType === 'bank_account'
        },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'accounting_operation' && horizontalType === 'reason') {
      const accountingId = Number(verticalValue);

      // 1- Deposits from receipt cash
      const depositQuery = this.receiptCashRepository
        .createQueryBuilder('rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rc.reason', 'reason')
        .leftJoinAndSelect('rn.currency', 'curr')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere('rc.accountingSettingRef = :accountingId', { accountingId });

      if (finalFromDate) {
        depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const depositsList = await depositQuery.getMany();

      // 2- Withdrawals from payment cash
      const withdrawalQuery = this.paymentCashRepository
        .createQueryBuilder('pc')
        .innerJoinAndSelect('pc.paymentNotification', 'pn')
        .leftJoinAndSelect('pc.reason', 'reason')
        .leftJoinAndSelect('pn.currency', 'curr')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('pc.accountingSettingRef = :accountingId', { accountingId });

      if (finalFromDate) {
        withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const withdrawalsList = await withdrawalQuery.getMany();

      // Combine and Group
      const groupedMap = new Map<string, any>();

      depositsList.forEach(item => {
        const key = item.reasonRef ? String(item.reasonRef) : 'empty';
        let title = 'نامشخص';
        let code = '-';
        if (item.reason) {
          title = (item.reason as any).title || (item.reason as any).Title || title;
          code = (item.reason as any).code || (item.reason as any).Code || code;
        }
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { id: key, code, title, deposits: 0, withdrawals: 0, balance: 0, currencyName: item.receiptNotification?.currency?.title || '-' });
        }
        const g = groupedMap.get(key);
        g.deposits += Number(item.amount || 0);
        g.balance = g.deposits - g.withdrawals;
      });

      withdrawalsList.forEach(item => {
        const key = item.reasonRef ? String(item.reasonRef) : 'empty';
        let title = 'نامشخص';
        let code = '-';
        if (item.reason) {
          title = (item.reason as any).title || (item.reason as any).Title || title;
          code = (item.reason as any).code || (item.reason as any).Code || code;
        }
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { id: key, code, title, deposits: 0, withdrawals: 0, balance: 0, currencyName: item.paymentNotification?.currency?.title || '-' });
        }
        const g = groupedMap.get(key);
        g.withdrawals += Number(item.amount || 0);
        g.balance = g.deposits - g.withdrawals;
      });

      const reportData = Array.from(groupedMap.values());

      return {
        success: true,
        reportData,
        horizontalConfig: { reason: true, accounting_operation: true },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'reason' && horizontalType === 'accounting_operation') {
      const reasonId = Number(verticalValue);

      // 1- Deposits from receipt cash
      const depositQuery = this.receiptCashRepository
        .createQueryBuilder('rc')
        .innerJoinAndSelect('rc.receiptNotification', 'rn')
        .leftJoinAndSelect('rc.accountingSetting', 'acc')
        .leftJoinAndSelect('rn.currency', 'curr')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId })
        .andWhere('rc.reasonRef = :reasonId', { reasonId });

      if (finalFromDate) {
        depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const depositsList = await depositQuery.getMany();

      // 2- Withdrawals from payment cash
      const withdrawalQuery = this.paymentCashRepository
        .createQueryBuilder('pc')
        .innerJoinAndSelect('pc.paymentNotification', 'pn')
        .leftJoinAndSelect('pc.accountingSetting', 'acc')
        .leftJoinAndSelect('pn.currency', 'curr')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId })
        .andWhere('pc.reasonRef = :reasonId', { reasonId });

      if (finalFromDate) {
        withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const withdrawalsList = await withdrawalQuery.getMany();

      // Combine and Group
      const groupedMap = new Map<string, any>();

      depositsList.forEach(item => {
        const key = item.accountingSettingRef ? String(item.accountingSettingRef) : 'empty';
        let title = 'نامشخص';
        let code = '-';
        if (item.accountingSetting) {
          title = (item.accountingSetting as any).title || (item.accountingSetting as any).Title || title;
          code = (item.accountingSetting as any).code || (item.accountingSetting as any).Code || code;
        }
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { id: key, code, title, deposits: 0, withdrawals: 0, balance: 0, currencyName: item.receiptNotification?.currency?.title || '-' });
        }
        const g = groupedMap.get(key);
        g.deposits += Number(item.amount || 0);
        g.balance = g.deposits - g.withdrawals;
      });

      withdrawalsList.forEach(item => {
        const key = item.accountingSettingRef ? String(item.accountingSettingRef) : 'empty';
        let title = 'نامشخص';
        let code = '-';
        if (item.accountingSetting) {
          title = (item.accountingSetting as any).title || (item.accountingSetting as any).Title || title;
          code = (item.accountingSetting as any).code || (item.accountingSetting as any).Code || code;
        }
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { id: key, code, title, deposits: 0, withdrawals: 0, balance: 0, currencyName: item.paymentNotification?.currency?.title || '-' });
        }
        const g = groupedMap.get(key);
        g.withdrawals += Number(item.amount || 0);
        g.balance = g.deposits - g.withdrawals;
      });

      const reportData = Array.from(groupedMap.values());

      return {
        success: true,
        reportData,
        horizontalConfig: { reason: true, accounting_operation: true },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'cash' && horizontalType === 'cash') {
      // Check basic info sharing setting (Rule 1)
      const isShared = await this.isBasicInfoShared(bsId);

      // Get active cashes based on sharing rule
      const cashesQuery = this.cashRepository
        .createQueryBuilder('ba')
        .leftJoinAndSelect('ba.detailedAccount', 'da')
        .where('ba.isActive = :isActive', { isActive: true });

      if (isShared) {
        cashesQuery.andWhere('ba.businessStructureRef = :bsId', { bsId });
      } else {
        cashesQuery.andWhere('ba.companyRef = :compId', { compId });
      }

      const cashes = await cashesQuery.getMany();

      // 5- Deposits from receipt cash (within optional date filter)
      const depositQuery = this.receiptCashRepository
        .createQueryBuilder('deposit')
        .innerJoinAndSelect('deposit.receiptNotification', 'rn')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        depositQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        depositQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const depositsList = await depositQuery.getMany();

      // 6- Withdrawals from payment cash (within optional date filter)
      const withdrawalQuery = this.paymentCashRepository
        .createQueryBuilder('withdrawal')
        .innerJoinAndSelect('withdrawal.paymentNotification', 'pn')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        withdrawalQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        withdrawalQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const withdrawalsList = await withdrawalQuery.getMany();

      // 8- Get all received cheques for the company and business structure (within optional date filter)
      const chequeQuery = this.receiptChequeRepository
        .createQueryBuilder('cheque')
        .innerJoinAndSelect('cheque.receiptNotification', 'rn')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        chequeQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        chequeQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const chequesList = await chequeQuery.getMany();

      const receivedChequeOpQuery = this.receivedChequeOperationItemRepository
        .createQueryBuilder('item')
        .innerJoinAndSelect('item.operation', 'op')
        .where('op.companyRef = :compId', { compId })
        .andWhere('op.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        receivedChequeOpQuery.andWhere('op.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        receivedChequeOpQuery.andWhere('op.documentDate <= :finalToDate', { finalToDate });
      }

      const receivedChequeOpsList = await receivedChequeOpQuery.getMany();

      const protestedChequeIdsSet = new Set(
        receivedChequeOpsList
          .filter(item => item.operation?.operationType === 2 && item.chequeStatus === 2)
          .map(item => Number(item.receiptChequeRef))
      );

      const paymentAssignmentQuery = this.paymentAssignmentRepository
        .createQueryBuilder('pa')
        .innerJoinAndSelect('pa.paymentNotification', 'pn')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        paymentAssignmentQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        paymentAssignmentQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const paymentAssignmentsList = await paymentAssignmentQuery.getMany();

      const receiptReturnedPaymentAssignmentQuery = this.receiptReturnedPaymentAssignmentRepository
        .createQueryBuilder('rrpa')
        .innerJoinAndSelect('rrpa.receiptNotification', 'rn')
        .leftJoinAndSelect('rrpa.paymentAssignment', 'pa')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        receiptReturnedPaymentAssignmentQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        receiptReturnedPaymentAssignmentQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const receiptReturnedPaymentAssignmentsList = await receiptReturnedPaymentAssignmentQuery.getMany();

      const paymentReturnedReceivedChequeQuery = this.paymentReturnedReceivedChequeRepository
        .createQueryBuilder('prrc')
        .innerJoinAndSelect('prrc.paymentNotification', 'pn')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        paymentReturnedReceivedChequeQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        paymentReturnedReceivedChequeQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const paymentReturnedReceivedChequesList = await paymentReturnedReceivedChequeQuery.getMany();

      // Get all received promissory notes for the company and business structure (within optional date filter)
      const promissoryQuery = this.receiptPromissoryNoteRepository
        .createQueryBuilder('rp')
        .innerJoinAndSelect('rp.receiptNotification', 'rn')
        .where('rn.companyRef = :compId', { compId })
        .andWhere('rn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        promissoryQuery.andWhere('rn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        promissoryQuery.andWhere('rn.documentDate <= :finalToDate', { finalToDate });
      }

      const promissoryList = await promissoryQuery.getMany();

      // Get all returned received promissory notes for the company and business structure (within optional date filter)
      const returnedPromissoryQuery = this.paymentReturnedReceivedPromissoryNoteRepository
        .createQueryBuilder('prrp')
        .innerJoinAndSelect('prrp.paymentNotification', 'pn')
        .innerJoinAndSelect('prrp.receiptPromissoryNote', 'rp')
        .where('pn.companyRef = :compId', { compId })
        .andWhere('pn.businessStructureRef = :bsId', { bsId });

      if (finalFromDate) {
        returnedPromissoryQuery.andWhere('pn.documentDate >= :finalFromDate', { finalFromDate });
      }
      if (finalToDate) {
        returnedPromissoryQuery.andWhere('pn.documentDate <= :finalToDate', { finalToDate });
      }

      const returnedPromissoryList = await returnedPromissoryQuery.getMany();

      const reportData = cashes.map(ba => {
        const initialBalance = Number(ba.initialBalance || 0);

        // Sum deposits for this cash register
        const deposits = depositsList
          .filter(d => Number(d.cashRef) === Number(ba.cashId))
          .reduce((sum, d) => sum + Number(d.amount || 0), 0);

        // Sum withdrawals for this cash register
        const withdrawals = withdrawalsList
          .filter(w => Number(w.cashRef) === Number(ba.cashId))
          .reduce((sum, w) => sum + Number(w.amount || 0), 0);

        const balance = initialBalance + deposits - withdrawals;

        const cashCheques = chequesList.filter(c => Number(c.cashRef) === Number(ba.cashId));
        const cashChequeIds = new Set(cashCheques.map(c => Number(c.receiptChequeId)));

        const sumReceiptCheques = cashCheques.reduce((sum, c) => sum + Number(c.amount || 0), 0);

        const uniqueChequesWithOps = new Set(
          receivedChequeOpsList
            .filter(op => cashChequeIds.has(Number(op.receiptChequeRef)))
            .map(op => Number(op.receiptChequeRef))
        );
        const sumReceivedChequeOps = Array.from(uniqueChequesWithOps).reduce((sum, chequeId) => {
          const cheque = cashCheques.find(c => Number(c.receiptChequeId) === chequeId);
          return sum + (cheque ? Number(cheque.amount || 0) : 0);
        }, 0);

        const sumPaymentAssignments = paymentAssignmentsList
          .filter(pa => cashChequeIds.has(Number(pa.receiptChequeRef)))
          .reduce((sum, pa) => sum + Number(pa.amount || 0), 0);

        const sumReceiptReturnedPaymentAssignments = receiptReturnedPaymentAssignmentsList
          .filter(rrpa => rrpa.paymentAssignment && cashChequeIds.has(Number(rrpa.paymentAssignment.receiptChequeRef)))
          .reduce((sum, rrpa) => sum + Number(rrpa.amount || 0), 0);

        const sumPaymentReturnedReceivedCheques = paymentReturnedReceivedChequesList
          .filter(prrc => cashChequeIds.has(Number(prrc.receiptChequeRef)))
          .reduce((sum, prrc) => sum + Number(prrc.amount || 0), 0);

        // Promissory Notes for this cash register
        const cashPromissories = promissoryList.filter(p => Number(p.cashRef) === Number(ba.cashId));
        const sumReceiptPromissories = cashPromissories.reduce((sum, p) => sum + Number(p.amount || 0), 0);

        const sumReturnedPromissories = returnedPromissoryList
          .filter(prrp => prrp.receiptPromissoryNote && Number(prrp.receiptPromissoryNote.cashRef) === Number(ba.cashId))
          .reduce((sum, prrp) => sum + Number(prrp.amount || 0), 0);

        const promissoryInCollection = sumReceiptPromissories - sumReturnedPromissories;

        const chequesInCollection = (sumReceiptCheques + sumReceiptReturnedPaymentAssignments) - (sumReceivedChequeOps + sumPaymentAssignments) + promissoryInCollection;

        // Sum cheques belonging to this cash register that are protested
        const bouncedCheques = chequesList
          .filter(c => Number(c.cashRef) === Number(ba.cashId) && protestedChequeIdsSet.has(Number(c.receiptChequeId)))
          .reduce((sum, c) => sum + Number(c.amount || 0), 0);

        return {
          id: ba.cashId.toString(),
          code: ba.detailedAccount?.code || ba.code || '',
          title: ba.title || '',
          initialBalance,
          deposits,
          withdrawals,
          balance,
          balanceType: balance >= 0 ? 'بدهکار' : 'بستانکار',
          chequesInCollection,
          bouncedCheques,
          payableCheques: 0,
        };
      }).filter(x => x.initialBalance !== 0 || x.deposits !== 0 || x.withdrawals !== 0 || x.chequesInCollection !== 0 || x.bouncedCheques !== 0);

      let hasPromissoryFlow = true;
      if (verticalValue && verticalValue !== 'all' && !isNaN(Number(verticalValue))) {
        const cashId = Number(verticalValue);
        const rpCount = await this.receiptPromissoryNoteRepository.count({ where: { cashRef: cashId } });
        const prrpCount = await this.paymentReturnedReceivedPromissoryNoteRepository
          .createQueryBuilder('prrp')
          .innerJoin('prrp.receiptPromissoryNote', 'rp')
          .where('rp.cashRef = :cashId', { cashId })
          .getCount();
        hasPromissoryFlow = rpCount > 0 || prrpCount > 0;
      }

      return {
        success: true,
        reportData,
        horizontalConfig: { detailedType_2: true, receipt_promissory_note: hasPromissoryFlow, accounting_operation: true, reason: true },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'receipt_promissory_note' && horizontalType === 'receipt_promissory_note') {
      const reportData: any[] = [];
      
      const isShared = await this.isBasicInfoShared(bsId);

      // We need to aggregate across all valid cashes
      const cashesQuery = this.cashRepository
        .createQueryBuilder('ba')
        .leftJoinAndSelect('ba.detailedAccount', 'da')
        .where('ba.isActive = :isActive', { isActive: true });

      if (isShared) {
        cashesQuery.andWhere('ba.businessStructureRef = :bsId', { bsId });
      } else {
        cashesQuery.andWhere('ba.companyRef = :compId', { compId });
      }

      const cashes = await cashesQuery.getMany();

      for (const cash of cashes) {
        // Cheques queries
        const rcQuery = this.receiptChequeRepository.createQueryBuilder('rc')
          .innerJoin('rc.receiptNotification', 'rn')
          .select('SUM(rc.amount)', 'total')
          .where('rc.cashRef = :cashId', { cashId: cash.cashId });

        const rrpaQuery = this.receiptReturnedPaymentAssignmentRepository.createQueryBuilder('rr')
          .innerJoin('rr.paymentAssignment', 'pa')
          .innerJoin('pa.receiptCheque', 'rc')
          .innerJoin('rr.receiptNotification', 'rn')
          .select('SUM(rr.amount)', 'total')
          .where('rc.cashRef = :cashId', { cashId: cash.cashId });

        const paQuery = this.paymentAssignmentRepository.createQueryBuilder('pa')
          .innerJoin('pa.receiptCheque', 'rc')
          .innerJoin('pa.paymentNotification', 'pn')
          .select('SUM(pa.amount)', 'total')
          .where('rc.cashRef = :cashId', { cashId: cash.cashId });

        const prrcQuery = this.paymentReturnedReceivedChequeRepository.createQueryBuilder('prrc')
          .innerJoin('prrc.receiptCheque', 'rc')
          .innerJoin('prrc.paymentNotification', 'pn')
          .select('SUM(prrc.amount)', 'total')
          .where('rc.cashRef = :cashId', { cashId: cash.cashId });

        if (finalFromDate) {
          rcQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
          rrpaQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
          paQuery.andWhere('pn.documentDate >= :fromDate', { fromDate: finalFromDate });
          prrcQuery.andWhere('pn.documentDate >= :fromDate', { fromDate: finalFromDate });
        }
        if (finalToDate) {
          rcQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
          rrpaQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
          paQuery.andWhere('pn.documentDate <= :toDate', { toDate: finalToDate });
          prrcQuery.andWhere('pn.documentDate <= :toDate', { toDate: finalToDate });
        }

        const rcRes = await rcQuery.getRawOne();
        const debit1 = Number(rcRes?.total || 0);

        const rrpaRes = await rrpaQuery.getRawOne();
        const debit2 = Number(rrpaRes?.total || 0);

        const paRes = await paQuery.getRawOne();
        const credit1 = Number(paRes?.total || 0);

        const prrcRes = await prrcQuery.getRawOne();
        const credit2 = Number(prrcRes?.total || 0);

        const debit = debit1 + debit2;
        const credit = credit1 + credit2;

        if (debit !== 0 || credit !== 0) {
          reportData.push({
            id: 'cheque_' + cash.cashId,
            docType: 'چک',
            code: cash.detailedAccount?.code || '',
            title: cash.title,
            debit,
            credit,
            balance: debit - credit,
            balanceType: debit > credit ? 'بدهکار' : debit < credit ? 'بستانکار' : 'بی حساب'
          });
        }

        // Promissory Notes queries
        const rpQuery = this.receiptPromissoryNoteRepository.createQueryBuilder('rp')
          .innerJoin('rp.receiptNotification', 'rn')
          .select('SUM(rp.amount)', 'total')
          .where('rp.cashRef = :cashId', { cashId: cash.cashId });

        const prrpQuery = this.paymentReturnedReceivedPromissoryNoteRepository.createQueryBuilder('prrp')
          .innerJoin('prrp.receiptPromissoryNote', 'rp')
          .innerJoin('prrp.paymentNotification', 'pn')
          .select('SUM(prrp.amount)', 'total')
          .where('rp.cashRef = :cashId', { cashId: cash.cashId });

        if (finalFromDate) {
          rpQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
          prrpQuery.andWhere('pn.documentDate >= :fromDate', { fromDate: finalFromDate });
        }
        if (finalToDate) {
          rpQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
          prrpQuery.andWhere('pn.documentDate <= :toDate', { toDate: finalToDate });
        }

        const rpRes = await rpQuery.getRawOne();
        const rpDebit = Number(rpRes?.total || 0);

        const prrpRes = await prrpQuery.getRawOne();
        const rpCredit = Number(prrpRes?.total || 0);

        if (rpDebit !== 0 || rpCredit !== 0) {
          reportData.push({
            id: 'promissory_' + cash.cashId,
            docType: 'سفته',
            code: cash.detailedAccount?.code || '',
            title: cash.title,
            debit: rpDebit,
            credit: rpCredit,
            balance: rpDebit - rpCredit,
            balanceType: rpDebit > rpCredit ? 'بدهکار' : rpDebit < rpCredit ? 'بستانکار' : 'بی حساب'
          });
        }
      }

      return {
        success: true,
        reportData,
        horizontalConfig: { receipt_promissory_note: true, detailedType_2: true },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'receipt_promissory_note' && horizontalType === 'detailedType_2') {
      const reportData: any[] = [];
      let cashId: number | null = null;
      let filterType: 'cheque' | 'promissory' | 'all' = 'all';

      if (verticalValue === 'promissory') {
        filterType = 'promissory';
      } else if (verticalValue === 'cheque') {
        filterType = 'cheque';
      } else if (verticalValue && verticalValue.startsWith('cheque_')) {
        filterType = 'cheque';
        cashId = Number(verticalValue.split('_')[1]);
      } else if (verticalValue && verticalValue.startsWith('promissory_')) {
        filterType = 'promissory';
        cashId = Number(verticalValue.split('_')[1]);
      } else if (verticalValue && verticalValue !== 'all') {
        cashId = Number(verticalValue);
      }

      const isShared = await this.isBasicInfoShared(bsId);

      const cashesQuery = this.cashRepository
        .createQueryBuilder('ba')
        .leftJoinAndSelect('ba.detailedAccount', 'da')
        .leftJoinAndSelect('ba.currency', 'currency')
        .where('ba.isActive = :isActive', { isActive: true });

      if (isShared) {
        cashesQuery.andWhere('ba.businessStructureRef = :bsId', { bsId });
      } else {
        cashesQuery.andWhere('ba.companyRef = :compId', { compId });
      }

      if (cashId !== null && !isNaN(cashId)) {
        cashesQuery.andWhere('ba.cashId = :cashId', { cashId });
      }

      const cashes = await cashesQuery.getMany();

      for (const cash of cashes) {
        let debit = 0;
        let credit = 0;

        if (filterType === 'cheque' || filterType === 'all') {
          const rcQuery = this.receiptChequeRepository.createQueryBuilder('rc')
            .innerJoin('rc.receiptNotification', 'rn')
            .select('SUM(rc.amount)', 'total')
            .where('rc.cashRef = :cashId', { cashId: cash.cashId });

          const rrpaQuery = this.receiptReturnedPaymentAssignmentRepository.createQueryBuilder('rr')
            .innerJoin('rr.paymentAssignment', 'pa')
            .innerJoin('pa.receiptCheque', 'rc')
            .innerJoin('rr.receiptNotification', 'rn')
            .select('SUM(rr.amount)', 'total')
            .where('rc.cashRef = :cashId', { cashId: cash.cashId });

          const paQuery = this.paymentAssignmentRepository.createQueryBuilder('pa')
            .innerJoin('pa.receiptCheque', 'rc')
            .innerJoin('pa.paymentNotification', 'pn')
            .select('SUM(pa.amount)', 'total')
            .where('rc.cashRef = :cashId', { cashId: cash.cashId });

          const prrcQuery = this.paymentReturnedReceivedChequeRepository.createQueryBuilder('prrc')
            .innerJoin('prrc.receiptCheque', 'rc')
            .innerJoin('prrc.paymentNotification', 'pn')
            .select('SUM(prrc.amount)', 'total')
            .where('rc.cashRef = :cashId', { cashId: cash.cashId });

          if (finalFromDate) {
            rcQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
            rrpaQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
            paQuery.andWhere('pn.documentDate >= :fromDate', { fromDate: finalFromDate });
            prrcQuery.andWhere('pn.documentDate >= :fromDate', { fromDate: finalFromDate });
          }
          if (finalToDate) {
            rcQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
            rrpaQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
            paQuery.andWhere('pn.documentDate <= :toDate', { toDate: finalToDate });
            prrcQuery.andWhere('pn.documentDate <= :toDate', { toDate: finalToDate });
          }

          const rcRes = await rcQuery.getRawOne();
          const debit1 = Number(rcRes?.total || 0);

          const rrpaRes = await rrpaQuery.getRawOne();
          const debit2 = Number(rrpaRes?.total || 0);

          const paRes = await paQuery.getRawOne();
          const credit1 = Number(paRes?.total || 0);

          const prrcRes = await prrcQuery.getRawOne();
          const credit2 = Number(prrcRes?.total || 0);

          debit += debit1 + debit2;
          credit += credit1 + credit2;
        } 
        
        if (filterType === 'promissory' || filterType === 'all') {
          const rpQuery = this.receiptPromissoryNoteRepository.createQueryBuilder('rp')
            .innerJoin('rp.receiptNotification', 'rn')
            .select('SUM(rp.amount)', 'total')
            .where('rp.cashRef = :cashId', { cashId: cash.cashId });

          const prrpQuery = this.paymentReturnedReceivedPromissoryNoteRepository.createQueryBuilder('prrp')
            .innerJoin('prrp.receiptPromissoryNote', 'rp')
            .innerJoin('prrp.paymentNotification', 'pn')
            .select('SUM(prrp.amount)', 'total')
            .where('rp.cashRef = :cashId', { cashId: cash.cashId });

          if (finalFromDate) {
            rpQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
            prrpQuery.andWhere('pn.documentDate >= :fromDate', { fromDate: finalFromDate });
          }
          if (finalToDate) {
            rpQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
            prrpQuery.andWhere('pn.documentDate <= :toDate', { toDate: finalToDate });
          }

          const rpRes = await rpQuery.getRawOne();
          debit += Number(rpRes?.total || 0);

          const prrpRes = await prrpQuery.getRawOne();
          credit += Number(prrpRes?.total || 0);
        }

        if (debit !== 0 || credit !== 0) {
          reportData.push({
            id: cash.cashId.toString(),
            docType: filterType === 'all' ? 'همه' : filterType === 'cheque' ? 'چک' : 'سفته',
            code: cash.detailedAccount?.code || cash.code || '',
            title: cash.title || '',
            debit,
            credit,
            balance: debit - credit,
            balanceType: debit > credit ? 'بدهکار' : debit < credit ? 'بستانکار' : 'بی حساب',
            currencyName: cash.currency?.title || ''
          });
        }
      }

      return {
        success: true,
        reportData,
        horizontalConfig: { detailedType_2: true, receipt_promissory_note: true },
        rawItemsForTableWithKeys: []
      };
    }

    if (verticalType === 'detailedType_2' && horizontalType === 'receipt_promissory_note') {
      const reportData: any[] = [];
      const cashId = Number(verticalValue);
      if (isNaN(cashId) || cashId <= 0) {
        return { success: true, reportData: [], horizontalConfig: {} };
      }

      let chequeDebit = 0;
      let chequeCredit = 0;

      const rcQuery = this.receiptChequeRepository.createQueryBuilder('rc')
        .innerJoin('rc.receiptNotification', 'rn')
        .select('SUM(rc.amount)', 'total')
        .where('rc.cashRef = :cashId', { cashId });

      const rrpaQuery = this.receiptReturnedPaymentAssignmentRepository.createQueryBuilder('rr')
        .innerJoin('rr.paymentAssignment', 'pa')
        .innerJoin('pa.receiptCheque', 'rc')
        .innerJoin('rr.receiptNotification', 'rn')
        .select('SUM(rr.amount)', 'total')
        .where('rc.cashRef = :cashId', { cashId });

      const paQuery = this.paymentAssignmentRepository.createQueryBuilder('pa')
        .innerJoin('pa.receiptCheque', 'rc')
        .innerJoin('pa.paymentNotification', 'pn')
        .select('SUM(pa.amount)', 'total')
        .where('rc.cashRef = :cashId', { cashId });

      const prrcQuery = this.paymentReturnedReceivedChequeRepository.createQueryBuilder('prrc')
        .innerJoin('prrc.receiptCheque', 'rc')
        .innerJoin('prrc.paymentNotification', 'pn')
        .select('SUM(prrc.amount)', 'total')
        .where('rc.cashRef = :cashId', { cashId });

      if (finalFromDate) {
        rcQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
        rrpaQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
        paQuery.andWhere('pn.documentDate >= :fromDate', { fromDate: finalFromDate });
        prrcQuery.andWhere('pn.documentDate >= :fromDate', { fromDate: finalFromDate });
      }
      if (finalToDate) {
        rcQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
        rrpaQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
        paQuery.andWhere('pn.documentDate <= :toDate', { toDate: finalToDate });
        prrcQuery.andWhere('pn.documentDate <= :toDate', { toDate: finalToDate });
      }

      const rcRes = await rcQuery.getRawOne();
      chequeDebit += Number(rcRes?.total || 0);

      const rrpaRes = await rrpaQuery.getRawOne();
      chequeDebit += Number(rrpaRes?.total || 0);

      const paRes = await paQuery.getRawOne();
      chequeCredit += Number(paRes?.total || 0);

      const prrcRes = await prrcQuery.getRawOne();
      chequeCredit += Number(prrcRes?.total || 0);

      if (chequeDebit !== 0 || chequeCredit !== 0) {
        reportData.push({
          id: 'cheque',
          docType: 'چک',
          code: '',
          title: '',
          debit: chequeDebit,
          credit: chequeCredit,
          balance: chequeDebit - chequeCredit,
          balanceType: chequeDebit > chequeCredit ? 'بدهکار' : chequeDebit < chequeCredit ? 'بستانکار' : 'بی حساب'
        });
      }

      let promDebit = 0;
      let promCredit = 0;

      const rpQuery = this.receiptPromissoryNoteRepository.createQueryBuilder('rp')
        .innerJoin('rp.receiptNotification', 'rn')
        .select('SUM(rp.amount)', 'total')
        .where('rp.cashRef = :cashId', { cashId });

      const prrpQuery = this.paymentReturnedReceivedPromissoryNoteRepository.createQueryBuilder('prrp')
        .innerJoin('prrp.receiptPromissoryNote', 'rp')
        .innerJoin('prrp.paymentNotification', 'pn')
        .select('SUM(prrp.amount)', 'total')
        .where('rp.cashRef = :cashId', { cashId });

      if (finalFromDate) {
        rpQuery.andWhere('rn.documentDate >= :fromDate', { fromDate: finalFromDate });
        prrpQuery.andWhere('pn.documentDate >= :fromDate', { fromDate: finalFromDate });
      }
      if (finalToDate) {
        rpQuery.andWhere('rn.documentDate <= :toDate', { toDate: finalToDate });
        prrpQuery.andWhere('pn.documentDate <= :toDate', { toDate: finalToDate });
      }

      const rpRes = await rpQuery.getRawOne();
      promDebit += Number(rpRes?.total || 0);

      const prrpRes = await prrpQuery.getRawOne();
      promCredit += Number(prrpRes?.total || 0);

      if (promDebit !== 0 || promCredit !== 0) {
        reportData.push({
          id: 'promissory',
          docType: 'سفته',
          code: '',
          title: '',
          debit: promDebit,
          credit: promCredit,
          balance: promDebit - promCredit,
          balanceType: promDebit > promCredit ? 'بدهکار' : promDebit < promCredit ? 'بستانکار' : 'بی حساب'
        });
      }

      return {
        success: true,
        reportData,
        horizontalConfig: { receipt_promissory_note: true, detailedType_2: true },
        rawItemsForTableWithKeys: []
      };
    }


    return { success: true, reportData: [], horizontalConfig: {} };
  }
}

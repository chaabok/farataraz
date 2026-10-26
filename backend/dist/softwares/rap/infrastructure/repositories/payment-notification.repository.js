"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentNotificationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_notification_entity_1 = require("../../domain/entities/payment-notification.entity");
const payment_cash_entity_1 = require("../../domain/entities/payment-cash.entity");
const payment_cheque_entity_1 = require("../../domain/entities/payment-cheque.entity");
const payment_withdrawal_entity_1 = require("../../domain/entities/payment-withdrawal.entity");
const payment_assignment_entity_1 = require("../../domain/entities/payment-assignment.entity");
const payment_promissory_note_entity_1 = require("../../domain/entities/payment-promissory-note.entity");
const payment_returned_received_cheque_entity_1 = require("../../domain/entities/payment-returned-received-cheque.entity");
const promissory_note_item_entity_1 = require("../../domain/entities/promissory-note-item.entity");
const chequebook_item_entity_1 = require("../../domain/entities/chequebook-item.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
function formatDateToLocalYYYYMMDD(date) {
    if (!date)
        return '';
    if (date instanceof Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    if (typeof date === 'string') {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        let str = date
            .replace(/[۰-۹]/g, w => persianDigits.indexOf(w).toString())
            .replace(/[٠-٩]/g, w => arabicDigits.indexOf(w).toString())
            .replace(/\//g, '-');
        const match = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (match) {
            const year = parseInt(match[1], 10);
            if (year >= 1300 && year < 1500) {
                const m = (0, moment_jalaali_1.default)(str, 'jYYYY-jMM-jDD');
                if (m.isValid()) {
                    return m.format('YYYY-MM-DD');
                }
            }
            else {
                const m = (0, moment_jalaali_1.default)(str, 'YYYY-MM-DD');
                if (m.isValid()) {
                    return m.format('YYYY-MM-DD');
                }
            }
        }
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
    }
    return '';
}
let PaymentNotificationRepository = class PaymentNotificationRepository {
    constructor(typeOrmRepo, idGenService) {
        this.typeOrmRepo = typeOrmRepo;
        this.idGenService = idGenService;
    }
    async findAll(businessStructureId, companyId) {
        const notifications = await this.typeOrmRepo.find({
            where: { businessStructureRef: businessStructureId, companyRef: companyId },
            relations: [
                'party', 'currency', 'voucherHeader',
                'cashItems', 'cashItems.cash', 'cashItems.accountingSetting', 'cashItems.reason',
                'chequeItems', 'chequeItems.bankAccount', 'chequeItems.chequebook', 'chequeItems.accountingSetting', 'chequeItems.reason',
                'withdrawalItems', 'withdrawalItems.bankAccount', 'withdrawalItems.accountingSetting', 'withdrawalItems.reason',
                'assignmentItems', 'assignmentItems.receiptCheque', 'assignmentItems.accountingSetting', 'assignmentItems.reason',
                'promissoryNoteItems', 'guaranteeItems', 'guaranteeItems.accountingSetting', 'guaranteeItems.reason', 'guaranteeItems.cash', 'guaranteeItems.currency', 'guaranteeItems.bank', 'guaranteeItems.bankAccount', 'promissoryNoteItems.accountingSetting', 'promissoryNoteItems.reason', 'promissoryNoteItems.currency',
                'returnedReceivedCheques', 'returnedReceivedCheques.receiptCheque', 'returnedReceivedCheques.receiptCheque.receiptNotification', 'returnedReceivedCheques.cash',
                'returnedReceivedPromissoryNotes', 'returnedReceivedPromissoryNotes.receiptPromissoryNote'
            ],
            order: { paymentNotificationId: 'DESC' }
        });
        for (const notification of notifications) {
            if ((notification.paymentType === 3 || notification.paymentType === 5) && notification.partyRef) {
                const bankAccount = await this.typeOrmRepo.manager.getRepository('BankAccount').findOne({
                    where: { bankAccountId: notification.partyRef }
                });
                if (bankAccount) {
                    notification.party = bankAccount;
                }
            }
            else if ((notification.paymentType === 4 || notification.paymentType === 6) && notification.partyRef) {
                const cash = await this.typeOrmRepo.manager.getRepository('Cash').findOne({
                    where: { cashId: notification.partyRef }
                });
                if (cash) {
                    notification.party = cash;
                }
            }
        }
        return notifications;
    }
    async findById(id, businessStructureId, companyId) {
        const notification = await this.typeOrmRepo.findOne({
            where: { paymentNotificationId: id, businessStructureRef: businessStructureId, companyRef: companyId },
            relations: [
                'party', 'currency', 'voucherHeader',
                'cashItems', 'cashItems.cash', 'cashItems.accountingSetting', 'cashItems.reason',
                'chequeItems', 'chequeItems.bankAccount', 'chequeItems.chequebook', 'chequeItems.accountingSetting', 'chequeItems.reason',
                'withdrawalItems', 'withdrawalItems.bankAccount', 'withdrawalItems.accountingSetting', 'withdrawalItems.reason',
                'assignmentItems', 'assignmentItems.receiptCheque', 'assignmentItems.accountingSetting', 'assignmentItems.reason', 'assignmentItems.receiptCheque.receiptNotification', 'assignmentItems.receiptCheque.accountingSetting',
                'promissoryNoteItems', 'guaranteeItems', 'guaranteeItems.accountingSetting', 'guaranteeItems.reason', 'guaranteeItems.cash', 'guaranteeItems.currency', 'guaranteeItems.bank', 'guaranteeItems.bankAccount', 'promissoryNoteItems.accountingSetting', 'promissoryNoteItems.reason', 'promissoryNoteItems.currency', 'promissoryNoteItems.promissoryNoteItem',
                'returnedReceivedCheques', 'returnedReceivedCheques.receiptCheque', 'returnedReceivedCheques.receiptCheque.receiptNotification', 'returnedReceivedCheques.cash',
                'returnedReceivedPromissoryNotes', 'returnedReceivedPromissoryNotes.receiptPromissoryNote', 'returnedReceivedPromissoryNotes.receiptPromissoryNote.accountingSetting', 'returnedReceivedPromissoryNotes.receiptPromissoryNote.reason'
            ]
        });
        if (notification && (notification.paymentType === 3 || notification.paymentType === 5) && notification.partyRef) {
            const bankAccount = await this.typeOrmRepo.manager.getRepository('BankAccount').findOne({
                where: { bankAccountId: notification.partyRef }
            });
            if (bankAccount) {
                notification.party = bankAccount;
            }
        }
        else if (notification && (notification.paymentType === 4 || notification.paymentType === 6) && notification.partyRef) {
            const cash = await this.typeOrmRepo.manager.getRepository('Cash').findOne({
                where: { cashId: notification.partyRef }
            });
            if (cash) {
                notification.party = cash;
            }
        }
        return notification;
    }
    async findPayableCheques(businessStructureId, companyId) {
        const rawData = await this.typeOrmRepo.manager.query(`
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
      WHERE pc."CompanyRef" = $1 AND pc."BusinessStructureRef" = $2
      AND pc."PaymentChequeID" NOT IN (
        SELECT "PaymentChequeRef" FROM "Rap"."ReceiptReturnedPaidCheque" WHERE "PaymentChequeRef" IS NOT NULL
      )
      AND pc."PaymentChequeID" NOT IN (
        SELECT "DocumentId" FROM "Rap"."PaidDocumentClearingItem" 
        WHERE "DocumentType" = 'cheque' AND "DocumentId" IS NOT NULL
      )
      `, [companyId, businessStructureId]);
        return rawData;
    }
    async findPayablePromissoryNotes(businessStructureId, companyId) {
        const rawData = await this.typeOrmRepo.manager.query(`
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
      WHERE ppn."CompanyRef" = $1 AND ppn."BusinessStructureRef" = $2
      AND ppn."PaymentPromissoryNoteID" NOT IN (
        SELECT "PaymentPromissoryNoteRef" FROM "Rap"."ReceiptReturnedPaymentPromissoryNote" WHERE "PaymentPromissoryNoteRef" IS NOT NULL
      )
      AND ppn."PaymentPromissoryNoteID" NOT IN (
        SELECT "DocumentId" FROM "Rap"."PaidDocumentClearingItem" 
        WHERE "DocumentType" = 'promissory_note' AND "DocumentId" IS NOT NULL
      )
      `, [companyId, businessStructureId]);
        return rawData;
    }
    async calculateNextDocumentNumber(dateStr, businessStructureId, companyId) {
        const manager = this.typeOrmRepo.manager;
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
        let config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
            where: {
                entityRef: 'payment_notification',
                companyRef: companyId,
            }
        });
        if (!config) {
            config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                where: {
                    entityRef: 'payment_notification',
                    businessStructureRef: businessStructureId,
                }
            });
        }
        let numberingMethod = '2';
        let baseNumbering = ['fiscalYear'];
        let items = null;
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
            const matchYear = fYears.find((fy) => fy.fiscalYearTitle === year);
            if (matchYear) {
                startNumber = parseInt(matchYear.startNumber || '1', 10);
                endNumber = parseInt(matchYear.endNumber || '999999', 10);
                fixedChar = matchYear.fixedChar || '';
            }
        }
        const hasFiscalYearCheck = baseNumbering.includes('fiscalYear');
        let query = this.typeOrmRepo.createQueryBuilder('p')
            .where('p.companyRef = :companyId', { companyId })
            .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });
        if (hasFiscalYearCheck) {
            const startJ = `${year}/01/01`;
            const endJ = `${parseInt(year, 10) + 1}/01/01`;
            const startDate = (0, moment_jalaali_1.default)(startJ, 'jYYYY/jMM/jDD').toDate();
            const endDate = (0, moment_jalaali_1.default)(endJ, 'jYYYY/jMM/jDD').toDate();
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
            }
            else {
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
    async create(data, businessStructureId, companyId) {
        const id = await this.idGenService.generateNextId('PaymentNotification');
        const entity = this.typeOrmRepo.create({
            paymentNotificationId: id,
            baseType: data.baseType ?? 1,
            baseNumber: data.baseNumber,
            paymentType: data.paymentType ?? 1,
            documentNumber: data.documentNumber,
            documentDate: formatDateToLocalYYYYMMDD(data.documentDate),
            partyRef: data.partyRef,
            currencyRef: data.currencyRef,
            voucherHeaderRef: data.voucherHeaderRef,
            exchangeRate: data.exchangeRate,
            description: data.description,
            status: data.status ?? 1,
            fiscalYearRef: data.fiscalYearRef ?? 1,
            businessStructureRef: businessStructureId,
            companyRef: companyId,
            cashItems: [],
            chequeItems: [],
            withdrawalItems: [],
            assignmentItems: [],
            promissoryNoteItems: [],
            returnedReceivedCheques: [],
            returnedReceivedPromissoryNotes: []
        });
        if (data.withdrawalItems && data.withdrawalItems.length > 0) {
            const startId = await this.idGenService.generateNextIdBlock('PaymentWithdrawal', data.withdrawalItems.length);
            let currentId = startId;
            for (const item of data.withdrawalItems) {
                const withdrawalItemId = currentId++;
                entity.withdrawalItems.push({
                    paymentWithdrawalId: withdrawalItemId,
                    paymentNotificationRef: id,
                    bankAccountRef: item.bankAccountRef,
                    amount: item.amount,
                    trackingNumber: item.trackingNumber,
                    accountingSettingRef: item.accountingSettingRef,
                    equivalentAmount: item.equivalentAmount,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.cashItems && data.cashItems.length > 0) {
            const startId = await this.idGenService.generateNextIdBlock('PaymentCash', data.cashItems.length);
            let currentId = startId;
            for (const item of data.cashItems) {
                const cashItemId = currentId++;
                entity.cashItems.push({
                    paymentCashId: cashItemId,
                    paymentNotificationRef: id,
                    cashRef: item.cashRef,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    equivalentAmount: item.equivalentAmount,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.chequeItems && data.chequeItems.length > 0) {
            const chequeNumbers = data.chequeItems.map(i => i.chequeNumber).filter(n => n);
            const uniqueCheques = new Set(chequeNumbers);
            if (uniqueCheques.size !== chequeNumbers.length) {
                throw new common_1.BadRequestException('یک شماره چک را نمی توان برای چند ردیف پرداخت در یک تراکنش استفاده کرد.');
            }
            const startId = await this.idGenService.generateNextIdBlock('PaymentCheque', data.chequeItems.length);
            let currentId = startId;
            const cbPromises = [];
            for (const item of data.chequeItems) {
                if (item.chequeNumber) {
                    const existingCheque = await this.typeOrmRepo.manager.getRepository(payment_cheque_entity_1.PaymentCheque).findOne({
                        where: {
                            chequeNumber: item.chequeNumber,
                            bankAccountRef: item.bankAccountRef,
                            companyRef: companyId,
                        }
                    });
                    if (existingCheque) {
                        throw new common_1.BadRequestException(`چک به شماره ${item.chequeNumber} قبلاً در سیستم برای پرداخت دیگری استفاده شده است.`);
                    }
                }
                const chequeItemId = currentId++;
                entity.chequeItems.push({
                    paymentChequeId: chequeItemId,
                    paymentNotificationRef: id,
                    accountingSettingRef: item.accountingSettingRef,
                    bankAccountRef: item.bankAccountRef,
                    chequebookRef: item.chequebookRef,
                    amount: item.amount,
                    chequeNumber: item.chequeNumber,
                    sayyadNumber: item.sayyadNumber,
                    endorsementNumber: item.endorsementNumber,
                    currency: item.currency,
                    dueDate: item.dueDate,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
                if (item.chequebookRef && item.chequeNumber) {
                    let dateStr = '';
                    if (data.documentDate) {
                        const cleanDate = formatDateToLocalYYYYMMDD(data.documentDate);
                        if (cleanDate) {
                            dateStr = (0, moment_jalaali_1.default)(cleanDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
                        }
                    }
                    cbPromises.push(this.typeOrmRepo.manager.createQueryBuilder()
                        .update(chequebook_item_entity_1.ChequebookItem)
                        .set({ status: chequebook_item_entity_1.CheckStatus.ISSUED, amount: item.amount, issueDate: dateStr })
                        .where('"ChequebookRef" = :cbRef AND "CheckNumber" = :cNum', { cbRef: item.chequebookRef, cNum: item.chequeNumber.toString() })
                        .execute());
                }
            }
            if (cbPromises.length > 0)
                await Promise.all(cbPromises);
        }
        if (data.assignmentItems && data.assignmentItems.length > 0) {
            const startId = await this.idGenService.generateNextIdBlock('PaymentAssignment', data.assignmentItems.length);
            let currentId = startId;
            for (const item of data.assignmentItems) {
                const assignmentItemId = currentId++;
                entity.assignmentItems.push({
                    paymentAssignmentId: assignmentItemId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    description: item.description,
                    receiptChequeRef: item.receiptChequeRef,
                    accountingSettingRef: item.accountingSettingRef,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.promissoryNoteItems && data.promissoryNoteItems.length > 0) {
            const startId = await this.idGenService.generateNextIdBlock('PaymentPromissoryNote', data.promissoryNoteItems.length);
            let currentId = startId;
            const pnPromises = [];
            for (const item of data.promissoryNoteItems) {
                const pnItemId = currentId++;
                entity.promissoryNoteItems.push({
                    paymentPromissoryNoteId: pnItemId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    reasonRef: item.reasonRef,
                    promissoryNoteItemRef: item.promissoryNoteItemRef,
                    currencyRef: item.currencyRef,
                    equivalentAmount: item.equivalentAmount,
                    dueDate: item.dueDate,
                    description: item.description,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
                if (item.promissoryNoteItemRef) {
                    pnPromises.push(this.typeOrmRepo.manager.update(promissory_note_item_entity_1.PromissoryNoteItem, { promissoryNoteItemId: item.promissoryNoteItemRef }, { status: 2 }));
                }
            }
            if (pnPromises.length > 0)
                await Promise.all(pnPromises);
        }
        if (data.returnedReceivedCheques && data.returnedReceivedCheques.length > 0) {
            const startId = await this.idGenService.generateNextIdBlock('PaymentReturnedReceivedCheque', data.returnedReceivedCheques.length);
            let currentId = startId;
            for (const item of data.returnedReceivedCheques) {
                const returnedChequeId = currentId++;
                entity.returnedReceivedCheques.push({
                    paymentReturnedReceivedChequeId: returnedChequeId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    receiptChequeRef: item.receiptChequeRef,
                    cashRef: item.cashRef,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    accountingSettingRef: item.accountingSettingRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.returnedReceivedPromissoryNotes && data.returnedReceivedPromissoryNotes.length > 0) {
            const { PaymentReturnedReceivedPromissoryNote } = require('../../domain/entities/payment-returned-received-promissory-note.entity');
            const startId = await this.idGenService.generateNextIdBlock('PaymentReturnedReceivedPromissoryNote', data.returnedReceivedPromissoryNotes.length);
            let currentId = startId;
            for (const item of data.returnedReceivedPromissoryNotes) {
                const returnedPromissoryNoteId = currentId++;
                entity.returnedReceivedPromissoryNotes.push({
                    paymentReturnedReceivedPromissoryNoteId: returnedPromissoryNoteId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    receiptPromissoryNoteRef: item.receiptPromissoryNoteRef,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    accountingSettingRef: item.accountingSettingRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.guaranteeItems && data.guaranteeItems.length > 0) {
            const startId = await this.idGenService.generateNextIdBlock("PaymentGuarantee", data.guaranteeItems.length);
            let currentId = startId;
            entity.guaranteeItems = [];
            for (const item of data.guaranteeItems) {
                const pnItemId = currentId++;
                entity.guaranteeItems.push({
                    paymentGuaranteeId: pnItemId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    reasonRef: item.reasonRef,
                    cashRef: item.cashRef,
                    currencyRef: item.currencyRef,
                    equivalentAmount: item.equivalentAmount,
                    dueDate: item.dueDate,
                    description: item.description,
                    guaranteeNumber: item.guaranteeNumber,
                    guaranteeType: item.guaranteeType,
                    baseDocument: item.baseDocument,
                    bankRef: item.bankRef,
                    bankAccountRef: item.bankAccountRef,
                    accountNumber: item.accountNumber,
                    notificationDate: item.notificationDate,
                    dynamicDetailedData: item.dynamicDetailedData,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        return this.typeOrmRepo.save(entity);
    }
    async update(id, data, businessStructureId, companyId) {
        const existing = await this.findById(id, businessStructureId, companyId);
        if (!existing) {
            throw new common_1.BadRequestException('Payment Notification not found');
        }
        existing.documentNumber = data.documentNumber ?? existing.documentNumber;
        if (data.baseType !== undefined)
            existing.baseType = data.baseType;
        if (data.baseNumber !== undefined)
            existing.baseNumber = data.baseNumber;
        if (data.paymentType !== undefined)
            existing.paymentType = data.paymentType;
        if (data.documentDate)
            existing.documentDate = formatDateToLocalYYYYMMDD(data.documentDate);
        if (data.partyRef !== undefined)
            existing.partyRef = data.partyRef;
        if (data.currencyRef !== undefined)
            existing.currencyRef = data.currencyRef;
        if (data.voucherHeaderRef !== undefined)
            existing.voucherHeaderRef = data.voucherHeaderRef;
        if (data.exchangeRate !== undefined)
            existing.exchangeRate = data.exchangeRate;
        if (data.description !== undefined)
            existing.description = data.description;
        if (data.status !== undefined)
            existing.status = data.status;
        if (data.fiscalYearRef !== undefined)
            existing.fiscalYearRef = data.fiscalYearRef;
        if (data.cashItems) {
            if (existing.cashItems && existing.cashItems.length > 0) {
                await this.typeOrmRepo.manager.delete(payment_cash_entity_1.PaymentCash, { paymentNotificationRef: id });
            }
            existing.cashItems = [];
            const newCashItemsCount = data.cashItems.filter(item => !item.paymentCashId).length;
            let cashItemsNextId = newCashItemsCount > 0 ? await this.idGenService.generateNextIdBlock('PaymentCash', newCashItemsCount) : 0;
            for (const item of data.cashItems) {
                const cashItemId = item.paymentCashId || cashItemsNextId++;
                existing.cashItems.push({
                    paymentCashId: cashItemId,
                    paymentNotificationRef: id,
                    cashRef: item.cashRef,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    equivalentAmount: item.equivalentAmount,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.chequeItems) {
            const chequeNumbers = data.chequeItems.map(i => i.chequeNumber).filter(n => n);
            const uniqueCheques = new Set(chequeNumbers);
            if (uniqueCheques.size !== chequeNumbers.length) {
                throw new common_1.BadRequestException('یک شماره چک را نمی توان برای چند ردیف پرداخت در یک تراکنش استفاده کرد.');
            }
            for (const item of data.chequeItems) {
                if (item.chequeNumber) {
                    const existingChequeQuery = this.typeOrmRepo.manager.createQueryBuilder(payment_cheque_entity_1.PaymentCheque, 'pc')
                        .where('pc.chequeNumber = :chequeNumber', { chequeNumber: item.chequeNumber })
                        .andWhere('pc.bankAccountRef = :bankAccountRef', { bankAccountRef: item.bankAccountRef })
                        .andWhere('pc.companyRef = :companyId', { companyId })
                        .andWhere('pc.paymentNotificationRef != :id', { id });
                    const existingCheque = await existingChequeQuery.getOne();
                    if (existingCheque) {
                        throw new common_1.BadRequestException(`چک به شماره ${item.chequeNumber} قبلاً در سیستم برای پرداخت دیگری استفاده شده است.`);
                    }
                }
            }
            if (existing.chequeItems && existing.chequeItems.length > 0) {
                const cbPromises = [];
                for (const old of existing.chequeItems) {
                    if (old.chequebookRef && old.chequeNumber) {
                        cbPromises.push(this.typeOrmRepo.manager.createQueryBuilder()
                            .update(chequebook_item_entity_1.ChequebookItem)
                            .set({ status: chequebook_item_entity_1.CheckStatus.NORMAL, amount: 0, issueDate: null, receiver: null })
                            .where('"ChequebookRef" = :cbRef AND "CheckNumber" = :cNum', { cbRef: old.chequebookRef, cNum: parseInt(old.chequeNumber, 10) })
                            .execute());
                    }
                }
                if (cbPromises.length > 0)
                    await Promise.all(cbPromises);
                await this.typeOrmRepo.manager.delete(payment_cheque_entity_1.PaymentCheque, { paymentNotificationRef: id });
            }
            existing.chequeItems = [];
            const newChequeItemsCount = data.chequeItems.filter(item => !item.paymentChequeId).length;
            let chequeItemsNextId = newChequeItemsCount > 0 ? await this.idGenService.generateNextIdBlock('PaymentCheque', newChequeItemsCount) : 0;
            const cbPromises = [];
            for (const item of data.chequeItems) {
                const chequeItemId = item.paymentChequeId || chequeItemsNextId++;
                existing.chequeItems.push({
                    paymentChequeId: chequeItemId,
                    paymentNotificationRef: id,
                    accountingSettingRef: item.accountingSettingRef,
                    bankAccountRef: item.bankAccountRef,
                    chequebookRef: item.chequebookRef,
                    amount: item.amount,
                    chequeNumber: item.chequeNumber,
                    sayyadNumber: item.sayyadNumber,
                    endorsementNumber: item.endorsementNumber,
                    currency: item.currency,
                    dueDate: item.dueDate,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
                if (item.chequebookRef && item.chequeNumber) {
                    let dateStr = '';
                    let docDate = data.documentDate || existing.documentDate;
                    if (docDate) {
                        const cleanDate = formatDateToLocalYYYYMMDD(docDate);
                        if (cleanDate) {
                            dateStr = (0, moment_jalaali_1.default)(cleanDate, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
                        }
                    }
                    cbPromises.push(this.typeOrmRepo.manager.createQueryBuilder()
                        .update(chequebook_item_entity_1.ChequebookItem)
                        .set({ status: chequebook_item_entity_1.CheckStatus.ISSUED, amount: item.amount, issueDate: dateStr })
                        .where('"ChequebookRef" = :cbRef AND "CheckNumber" = :cNum', { cbRef: item.chequebookRef, cNum: item.chequeNumber.toString() })
                        .execute());
                }
            }
            if (cbPromises.length > 0)
                await Promise.all(cbPromises);
        }
        if (data.withdrawalItems) {
            if (existing.withdrawalItems && existing.withdrawalItems.length > 0) {
                await this.typeOrmRepo.manager.delete(payment_withdrawal_entity_1.PaymentWithdrawal, { paymentNotificationRef: id });
            }
            existing.withdrawalItems = [];
            const newWithdrawalItemsCount = data.withdrawalItems.filter(item => !item.paymentWithdrawalId).length;
            let withdrawalItemsNextId = newWithdrawalItemsCount > 0 ? await this.idGenService.generateNextIdBlock('PaymentWithdrawal', newWithdrawalItemsCount) : 0;
            for (const item of data.withdrawalItems) {
                const withdrawalItemId = item.paymentWithdrawalId || withdrawalItemsNextId++;
                existing.withdrawalItems.push({
                    paymentWithdrawalId: withdrawalItemId,
                    paymentNotificationRef: id,
                    bankAccountRef: item.bankAccountRef,
                    amount: item.amount,
                    trackingNumber: item.trackingNumber,
                    accountingSettingRef: item.accountingSettingRef,
                    equivalentAmount: item.equivalentAmount,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.assignmentItems) {
            if (existing.assignmentItems && existing.assignmentItems.length > 0) {
                await this.typeOrmRepo.manager.delete(payment_assignment_entity_1.PaymentAssignment, { paymentNotificationRef: id });
            }
            existing.assignmentItems = [];
            const newAssignmentItemsCount = data.assignmentItems.filter((item) => !item.paymentAssignmentId).length;
            let assignmentItemsNextId = newAssignmentItemsCount > 0 ? await this.idGenService.generateNextIdBlock('PaymentAssignment', newAssignmentItemsCount) : 0;
            for (const item of data.assignmentItems) {
                const assignmentItemId = item.paymentAssignmentId || assignmentItemsNextId++;
                existing.assignmentItems.push({
                    paymentAssignmentId: assignmentItemId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    description: item.description,
                    receiptChequeRef: item.receiptChequeRef,
                    accountingSettingRef: item.accountingSettingRef,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.promissoryNoteItems) {
            if (existing.promissoryNoteItems && existing.promissoryNoteItems.length > 0) {
                const revertPromises = [];
                for (const old of existing.promissoryNoteItems) {
                    if (old.promissoryNoteItemRef) {
                        revertPromises.push(this.typeOrmRepo.manager.update(promissory_note_item_entity_1.PromissoryNoteItem, { promissoryNoteItemId: old.promissoryNoteItemRef }, { status: 1 }));
                    }
                }
                if (revertPromises.length > 0)
                    await Promise.all(revertPromises);
                await this.typeOrmRepo.manager.delete(payment_promissory_note_entity_1.PaymentPromissoryNote, { paymentNotificationRef: id });
            }
            existing.promissoryNoteItems = [];
            const newPnItemsCount = data.promissoryNoteItems.filter((item) => !item.paymentPromissoryNoteId).length;
            let pnItemsNextId = newPnItemsCount > 0 ? await this.idGenService.generateNextIdBlock('PaymentPromissoryNote', newPnItemsCount) : 0;
            const pnPromises = [];
            for (const item of data.promissoryNoteItems) {
                const pnItemId = item.paymentPromissoryNoteId || pnItemsNextId++;
                existing.promissoryNoteItems.push({
                    paymentPromissoryNoteId: pnItemId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    reasonRef: item.reasonRef,
                    promissoryNoteItemRef: item.promissoryNoteItemRef,
                    currencyRef: item.currencyRef,
                    equivalentAmount: item.equivalentAmount,
                    dueDate: item.dueDate,
                    description: item.description,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
                if (item.promissoryNoteItemRef) {
                    pnPromises.push(this.typeOrmRepo.manager.update(promissory_note_item_entity_1.PromissoryNoteItem, { promissoryNoteItemId: item.promissoryNoteItemRef }, { status: 2 }));
                }
            }
            if (pnPromises.length > 0)
                await Promise.all(pnPromises);
        }
        if (data.returnedReceivedCheques) {
            if (existing.returnedReceivedCheques && existing.returnedReceivedCheques.length > 0) {
                await this.typeOrmRepo.manager.delete(payment_returned_received_cheque_entity_1.PaymentReturnedReceivedCheque, { paymentNotificationRef: id });
            }
            existing.returnedReceivedCheques = [];
            const newReturnedChequesCount = data.returnedReceivedCheques.filter((item) => !item.paymentReturnedReceivedChequeId).length;
            let rcItemsNextId = newReturnedChequesCount > 0 ? await this.idGenService.generateNextIdBlock('PaymentReturnedReceivedCheque', newReturnedChequesCount) : 0;
            for (const item of data.returnedReceivedCheques) {
                const rcItemId = item.paymentReturnedReceivedChequeId || rcItemsNextId++;
                existing.returnedReceivedCheques.push({
                    paymentReturnedReceivedChequeId: rcItemId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    description: item.description,
                    receiptChequeRef: item.receiptChequeRef,
                    cashRef: item.cashRef,
                    reasonRef: item.reasonRef,
                    accountingSettingRef: item.accountingSettingRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.returnedReceivedPromissoryNotes) {
            const { PaymentReturnedReceivedPromissoryNote } = require('../../domain/entities/payment-returned-received-promissory-note.entity');
            if (existing.returnedReceivedPromissoryNotes && existing.returnedReceivedPromissoryNotes.length > 0) {
                await this.typeOrmRepo.manager.delete(PaymentReturnedReceivedPromissoryNote, { paymentNotificationRef: id });
            }
            existing.returnedReceivedPromissoryNotes = [];
            const newReturnedPromissoryNotesCount = data.returnedReceivedPromissoryNotes.filter((item) => !item.paymentReturnedReceivedPromissoryNoteId).length;
            let rrpnItemsNextId = newReturnedPromissoryNotesCount > 0 ? await this.idGenService.generateNextIdBlock('PaymentReturnedReceivedPromissoryNote', newReturnedPromissoryNotesCount) : 0;
            for (const item of data.returnedReceivedPromissoryNotes) {
                const rrpnItemId = item.paymentReturnedReceivedPromissoryNoteId || rrpnItemsNextId++;
                existing.returnedReceivedPromissoryNotes.push({
                    paymentReturnedReceivedPromissoryNoteId: rrpnItemId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    description: item.description,
                    receiptPromissoryNoteRef: item.receiptPromissoryNoteRef,
                    reasonRef: item.reasonRef,
                    accountingSettingRef: item.accountingSettingRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.guaranteeItems) {
            const { PaymentGuarantee } = require("../../domain/entities/payment-guarantee.entity");
            if (existing.guaranteeItems && existing.guaranteeItems.length > 0) {
                await this.typeOrmRepo.manager.delete(PaymentGuarantee, { paymentNotificationRef: id });
            }
            existing.guaranteeItems = [];
            const newPnItemsCount = data.guaranteeItems.filter((item) => !item.paymentGuaranteeId).length;
            let pnItemsNextId = newPnItemsCount > 0 ? await this.idGenService.generateNextIdBlock("PaymentGuarantee", newPnItemsCount) : 0;
            for (const item of data.guaranteeItems) {
                const pnItemId = item.paymentGuaranteeId || pnItemsNextId++;
                existing.guaranteeItems.push({
                    paymentGuaranteeId: pnItemId,
                    paymentNotificationRef: id,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    reasonRef: item.reasonRef,
                    cashRef: item.cashRef,
                    currencyRef: item.currencyRef,
                    equivalentAmount: item.equivalentAmount,
                    dueDate: item.dueDate,
                    description: item.description,
                    guaranteeNumber: item.guaranteeNumber,
                    guaranteeType: item.guaranteeType,
                    baseDocument: item.baseDocument,
                    bankRef: item.bankRef,
                    bankAccountRef: item.bankAccountRef,
                    accountNumber: item.accountNumber,
                    notificationDate: item.notificationDate,
                    dynamicDetailedData: item.dynamicDetailedData,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        return this.typeOrmRepo.save(existing);
    }
    async remove(id, businessStructureId, companyId) {
        const existing = await this.findById(id, businessStructureId, companyId);
        if (existing) {
            if (existing.chequeItems && existing.chequeItems.length > 0) {
                const cbPromises = [];
                for (const item of existing.chequeItems) {
                    if (item.chequebookRef && item.chequeNumber) {
                        cbPromises.push(this.typeOrmRepo.manager.createQueryBuilder()
                            .update(chequebook_item_entity_1.ChequebookItem)
                            .set({ status: chequebook_item_entity_1.CheckStatus.NORMAL, amount: 0, issueDate: null, receiver: null })
                            .where('"ChequebookRef" = :cbRef AND "CheckNumber" = :cNum', { cbRef: item.chequebookRef, cNum: parseInt(item.chequeNumber, 10) })
                            .execute());
                    }
                }
                if (cbPromises.length > 0)
                    await Promise.all(cbPromises);
            }
            if (existing.promissoryNoteItems && existing.promissoryNoteItems.length > 0) {
                const pnPromises = [];
                for (const old of existing.promissoryNoteItems) {
                    if (old.promissoryNoteItemRef) {
                        pnPromises.push(this.typeOrmRepo.manager.update(promissory_note_item_entity_1.PromissoryNoteItem, { promissoryNoteItemId: old.promissoryNoteItemRef }, { status: 1 }));
                    }
                }
                if (pnPromises.length > 0)
                    await Promise.all(pnPromises);
            }
            await this.typeOrmRepo.remove(existing);
        }
    }
};
exports.PaymentNotificationRepository = PaymentNotificationRepository;
exports.PaymentNotificationRepository = PaymentNotificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_notification_entity_1.PaymentNotification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService])
], PaymentNotificationRepository);
//# sourceMappingURL=payment-notification.repository.js.map
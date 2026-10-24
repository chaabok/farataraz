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
exports.ReceiptNotificationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
const receipt_notification_entity_1 = require("../../domain/entities/receipt-notification.entity");
const receipt_cash_entity_1 = require("../../domain/entities/receipt-cash.entity");
const receipt_cheque_entity_1 = require("../../domain/entities/receipt-cheque.entity");
const payment_assignment_entity_1 = require("../../domain/entities/payment-assignment.entity");
const payment_returned_received_cheque_entity_1 = require("../../domain/entities/payment-returned-received-cheque.entity");
const received_cheque_operation_item_entity_1 = require("../../domain/entities/received-cheque-operation-item.entity");
const received_cheque_operation_entity_1 = require("../../domain/entities/received-cheque-operation.entity");
const receipt_deposit_entity_1 = require("../../domain/entities/receipt-deposit.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
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
let ReceiptNotificationRepository = class ReceiptNotificationRepository {
    constructor(typeOrmRepo, idGenService) {
        this.typeOrmRepo = typeOrmRepo;
        this.idGenService = idGenService;
    }
    async findAll(businessStructureId, companyId) {
        return this.typeOrmRepo.find({
            where: { businessStructureRef: businessStructureId, companyRef: companyId },
            relations: [
                'party', 'currency', 'reason', 'voucherHeader',
                'cashItems', 'cashItems.cash', 'cashItems.accountingSetting', 'cashItems.reason',
                'chequeItems', 'chequeItems.bank', 'chequeItems.accountingSetting', 'chequeItems.reason', 'chequeItems.cash',
                'depositItems', 'depositItems.bankAccount', 'depositItems.accountingSetting', 'depositItems.reason',
                'returnedPaidCheques', 'returnedPaidCheques.paymentCheque', 'returnedPaidCheques.accountingSetting', 'returnedPaidCheques.reason', 'returnedPaidCheques.cash',
                'returnedPaidCheques.paymentCheque.accountingSetting', 'returnedPaidCheques.paymentCheque.reason',
                'returnedPaidCheques.paymentCheque.paymentNotification', 'returnedPaidCheques.paymentCheque.paymentNotification.party',
                'returnedPaymentAssignments', 'returnedPaymentAssignments.paymentAssignment', 'returnedPaymentAssignments.accountingSetting', 'returnedPaymentAssignments.reason', 'returnedPaymentAssignments.cash',
                'returnedPaymentPromissoryNotes', 'returnedPaymentPromissoryNotes.paymentPromissoryNote', 'returnedPaymentPromissoryNotes.paymentPromissoryNote.promissoryNoteItem', 'returnedPaymentPromissoryNotes.accountingSetting', 'returnedPaymentPromissoryNotes.reason',
                'promissoryNoteItems', 'guaranteeItems', 'guaranteeItems.accountingSetting', 'guaranteeItems.reason', 'guaranteeItems.cash', 'promissoryNoteItems.accountingSetting', 'promissoryNoteItems.reason', 'promissoryNoteItems.cash'
            ],
            order: { receiptNotificationId: 'DESC' }
        });
    }
    async findById(id, businessStructureId, companyId) {
        return this.typeOrmRepo.findOne({
            where: { receiptNotificationId: id, businessStructureRef: businessStructureId, companyRef: companyId },
            relations: [
                'party', 'currency', 'reason', 'voucherHeader',
                'cashItems', 'cashItems.cash', 'cashItems.accountingSetting', 'cashItems.reason',
                'chequeItems', 'chequeItems.bank', 'chequeItems.accountingSetting', 'chequeItems.reason', 'chequeItems.cash',
                'depositItems', 'depositItems.bankAccount', 'depositItems.accountingSetting', 'depositItems.reason',
                'returnedPaidCheques', 'returnedPaidCheques.paymentCheque', 'returnedPaidCheques.accountingSetting', 'returnedPaidCheques.reason', 'returnedPaidCheques.cash',
                'returnedPaidCheques.paymentCheque.accountingSetting', 'returnedPaidCheques.paymentCheque.reason',
                'returnedPaidCheques.paymentCheque.paymentNotification', 'returnedPaidCheques.paymentCheque.paymentNotification.party',
                'returnedPaymentAssignments', 'returnedPaymentAssignments.paymentAssignment', 'returnedPaymentAssignments.accountingSetting', 'returnedPaymentAssignments.reason', 'returnedPaymentAssignments.paymentAssignment.receiptCheque', 'returnedPaymentAssignments.cash',
                'returnedPaymentPromissoryNotes', 'returnedPaymentPromissoryNotes.paymentPromissoryNote', 'returnedPaymentPromissoryNotes.paymentPromissoryNote.promissoryNoteItem', 'returnedPaymentPromissoryNotes.accountingSetting', 'returnedPaymentPromissoryNotes.reason',
                'promissoryNoteItems', 'guaranteeItems', 'guaranteeItems.accountingSetting', 'guaranteeItems.reason', 'guaranteeItems.cash', 'promissoryNoteItems.accountingSetting', 'promissoryNoteItems.reason', 'promissoryNoteItems.cash'
            ]
        });
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
    async getAssignedCheques(businessStructureId, companyId, partyRef) {
        const qb = this.typeOrmRepo.manager.createQueryBuilder(payment_assignment_entity_1.PaymentAssignment, 'pa')
            .leftJoinAndSelect('pa.paymentNotification', 'pn')
            .leftJoinAndSelect('pa.receiptCheque', 'rc')
            .leftJoinAndSelect('pa.accountingSetting', 'as')
            .leftJoinAndSelect('pa.reason', 'reason')
            .leftJoinAndSelect('rc.bank', 'bank')
            .leftJoinAndSelect('rc.receiptNotification', 'rn')
            .leftJoinAndSelect('rn.party', 'party')
            .leftJoinAndSelect('rn.currency', 'currency')
            .where('pn.companyRef = :companyId', { companyId })
            .andWhere('pn.businessStructureRef = :businessStructureId', { businessStructureId });
        if (partyRef) {
            qb.andWhere('pn.partyRef = :partyRef', { partyRef });
        }
        const assignments = await qb.getMany();
        return assignments.map(pa => ({
            chequeNumber: pa.receiptCheque?.chequeNumber,
            transferChequeDate: pa.receiptCheque?.receiptNotification?.documentDate
                ? (0, moment_jalaali_1.default)(pa.receiptCheque.receiptNotification.documentDate).format('jYYYY/jMM/jDD')
                : '',
            partyName: pa.receiptCheque?.receiptNotification?.party?.title || pa.receiptCheque?.receiptNotification?.party?.partyName || (pa.receiptCheque?.receiptNotification?.party?.firstName ? `${pa.receiptCheque.receiptNotification.party.firstName} ${pa.receiptCheque.receiptNotification.party.lastName || ''}` : ''),
            amount: pa.receiptCheque?.amount,
            bankName: pa.receiptCheque?.bank?.title || '',
            branchName: pa.receiptCheque?.branchName || '',
            opCode: pa.accountingSetting?.code || '',
            opTitle: pa.accountingSetting?.title || '',
            opId: pa.accountingSetting?.recieptAndPaymentAccountingSettingId || null,
            reasonTitle: pa.reason?.Title || pa.reason?.title || '',
            reasonId: pa.reason?.RapReasonID || null,
            description: pa.receiptCheque?.description || '',
            id: pa.paymentAssignmentId,
            receiptChequeId: pa.receiptCheque?.receiptChequeId,
            currency: pa.receiptCheque?.receiptNotification?.currency?.title || 'ریال',
            endorsement_number: pa.receiptCheque?.endorsementNumber || '',
            sayad_code: pa.receiptCheque?.sayyadNumber || '',
        }));
    }
    async getAvailableCheques(businessStructureId, companyId, operationType, bankAccountRef) {
        const qb = this.typeOrmRepo.manager.createQueryBuilder(receipt_cheque_entity_1.ReceiptCheque, 'rc')
            .leftJoinAndSelect('rc.receiptNotification', 'rn')
            .leftJoinAndSelect('rn.party', 'party')
            .leftJoinAndSelect('rn.currency', 'currency')
            .leftJoinAndSelect('rc.bank', 'bank')
            .leftJoinAndSelect('rc.reason', 'reason')
            .leftJoinAndSelect('rc.accountingSetting', 'as')
            .where('rc.companyRef = :companyId', { companyId })
            .andWhere('rc.businessStructureRef = :businessStructureId', { businessStructureId })
            .andWhere('rn.status != 1');
        qb.andWhere(subQueryBuilder => {
            const subQuery = subQueryBuilder.subQuery()
                .select('pa.receiptChequeRef')
                .from(payment_assignment_entity_1.PaymentAssignment, 'pa')
                .where('pa.receiptChequeRef = rc.receiptChequeId')
                .getQuery();
            return `NOT EXISTS ${subQuery}`;
        });
        if (operationType === '2') {
            qb.andWhere(subQueryBuilder => {
                let subQuery = subQueryBuilder.subQuery()
                    .select('rcoi1.receiptChequeRef')
                    .from(received_cheque_operation_item_entity_1.ReceivedChequeOperationItem, 'rcoi1')
                    .innerJoin(received_cheque_operation_entity_1.ReceivedChequeOperation, 'rco1', 'rco1.receivedChequeOperationId = rcoi1.operationRef')
                    .where('rcoi1.receiptChequeRef = rc.receiptChequeId')
                    .andWhere('rco1.operationType = 1')
                    .andWhere('rco1.status != 1');
                if (bankAccountRef) {
                    subQuery = subQuery.andWhere('rco1.bankAccountRef = :bankAccountRef');
                }
                return `EXISTS ${subQuery.getQuery()}`;
            });
            if (bankAccountRef) {
                qb.setParameter('bankAccountRef', bankAccountRef);
            }
            qb.andWhere(subQueryBuilder => {
                const subQuery = subQueryBuilder.subQuery()
                    .select('rcoi2.receiptChequeRef')
                    .from(received_cheque_operation_item_entity_1.ReceivedChequeOperationItem, 'rcoi2')
                    .innerJoin(received_cheque_operation_entity_1.ReceivedChequeOperation, 'rco2', 'rco2.receivedChequeOperationId = rcoi2.operationRef')
                    .where('rcoi2.receiptChequeRef = rc.receiptChequeId')
                    .andWhere('rco2.operationType = 2')
                    .getQuery();
                return `NOT EXISTS ${subQuery}`;
            });
        }
        else {
            qb.andWhere(subQueryBuilder => {
                const subQuery = subQueryBuilder.subQuery()
                    .select('rcoi.receiptChequeRef')
                    .from(received_cheque_operation_item_entity_1.ReceivedChequeOperationItem, 'rcoi')
                    .innerJoin(received_cheque_operation_entity_1.ReceivedChequeOperation, 'rco', 'rco.receivedChequeOperationId = rcoi.operationRef')
                    .where('rcoi.receiptChequeRef = rc.receiptChequeId')
                    .andWhere('rco.operationType IN (1, 3, 4)')
                    .getQuery();
                return `NOT EXISTS ${subQuery}`;
            });
        }
        const cheques = await qb.getMany();
        return cheques.map(c => ({
            chequeNumber: c.chequeNumber,
            transferChequeDate: c.receiptNotification?.documentDate
                ? (0, moment_jalaali_1.default)(c.receiptNotification.documentDate).format('jYYYY/jMM/jDD')
                : '',
            partyName: c.receiptNotification?.party?.title || c.receiptNotification?.party?.partyName || (c.receiptNotification?.party?.firstName ? `${c.receiptNotification.party.firstName} ${c.receiptNotification.party.lastName || ''}` : ''),
            amount: c.amount,
            bankName: c.bank?.title || '',
            branchName: c.branchName || '',
            opCode: c.accountingSetting?.code || '',
            opTitle: c.accountingSetting?.title || '',
            opId: c.accountingSetting?.recieptAndPaymentAccountingSettingId || null,
            description: c.description || '',
            id: c.receiptChequeId,
            currency: c.receiptNotification?.currency?.title || 'ریال',
            endorsement_number: c.endorsementNumber || '',
            sayad_code: c.sayyadNumber || '',
        }));
    }
    async getAvailableChequesForAssignment(businessStructureId, companyId) {
        const qb = this.typeOrmRepo.manager.createQueryBuilder(receipt_cheque_entity_1.ReceiptCheque, 'rc')
            .leftJoinAndSelect('rc.receiptNotification', 'rn')
            .leftJoinAndSelect('rn.party', 'party')
            .leftJoinAndSelect('rn.currency', 'currency')
            .leftJoinAndSelect('rc.bank', 'bank')
            .leftJoinAndSelect('rc.reason', 'reason')
            .leftJoinAndSelect('rc.accountingSetting', 'as')
            .where('rc.companyRef = :companyId', { companyId })
            .andWhere('rc.businessStructureRef = :businessStructureId', { businessStructureId });
        qb.andWhere('rn.status IN (5, 8)');
        qb.andWhere(subQueryBuilder => {
            const subQuery = subQueryBuilder.subQuery()
                .select('pa.receiptChequeRef')
                .from(payment_assignment_entity_1.PaymentAssignment, 'pa')
                .where('pa.receiptChequeRef = rc.receiptChequeId')
                .getQuery();
            return `NOT EXISTS ${subQuery}`;
        });
        qb.andWhere(subQueryBuilder => {
            const subQuery = subQueryBuilder.subQuery()
                .select('prrc.receiptChequeRef')
                .from(payment_returned_received_cheque_entity_1.PaymentReturnedReceivedCheque, 'prrc')
                .where('prrc.receiptChequeRef = rc.receiptChequeId')
                .getQuery();
            return `NOT EXISTS ${subQuery}`;
        });
        qb.andWhere(subQueryBuilder => {
            const subQuery = subQueryBuilder.subQuery()
                .select('rcoi.receiptChequeRef')
                .from(received_cheque_operation_item_entity_1.ReceivedChequeOperationItem, 'rcoi')
                .innerJoin(received_cheque_operation_entity_1.ReceivedChequeOperation, 'rco', 'rco.receivedChequeOperationId = rcoi.operationRef')
                .where('rcoi.receiptChequeRef = rc.receiptChequeId')
                .andWhere('rco.operationType IN (1, 3, 4)')
                .getQuery();
            return `NOT EXISTS ${subQuery}`;
        });
        const cheques = await qb.getMany();
        return cheques.map(c => ({
            id: c.receiptChequeId,
            receiptChequeId: c.receiptChequeId,
            chequeNumber: c.chequeNumber,
            amount: c.amount,
            transferChequeDate: c.receiptNotification?.documentDate
                ? (0, moment_jalaali_1.default)(c.receiptNotification.documentDate).format('jYYYY/jMM/jDD')
                : '',
            bankName: c.bank?.title || '',
            branchName: c.branchName || '',
            currency: c.receiptNotification?.currency?.title || 'ریال',
            sayad_code: c.sayyadNumber || '',
            partyName: c.receiptNotification?.party?.title || c.receiptNotification?.party?.partyName || (c.receiptNotification?.party?.firstName ? `${c.receiptNotification.party.firstName} ${c.receiptNotification.party.lastName || ''}` : ''),
            description: c.description || '',
            opCode: c.accountingSetting?.code || '',
            opTitle: c.accountingSetting?.title || '',
            opId: c.accountingSetting?.recieptAndPaymentAccountingSettingId || null,
            reasonTitle: c.reason?.Title || c.reason?.title || '',
            reasonId: c.reason?.RapReasonID || null,
            receiptNotificationRef: c.receiptNotificationRef,
        }));
    }
    async getReturnableCheques(businessStructureId, companyId, partyRef, excludeIds) {
        const qb = this.typeOrmRepo.manager.createQueryBuilder(receipt_cheque_entity_1.ReceiptCheque, 'rc')
            .leftJoinAndSelect('rc.receiptNotification', 'rn')
            .leftJoinAndSelect('rn.party', 'party')
            .leftJoinAndSelect('rn.currency', 'currency')
            .leftJoinAndSelect('rc.bank', 'bank')
            .where('rc.companyRef = :companyId', { companyId })
            .andWhere('rc.businessStructureRef = :businessStructureId', { businessStructureId });
        if (partyRef) {
            qb.andWhere('rn.partyRef = :partyRef', { partyRef });
        }
        if (excludeIds) {
            const ids = excludeIds.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
            if (ids.length > 0) {
                qb.andWhere('rc.receiptChequeId NOT IN (:...excludeIds)', { excludeIds: ids });
            }
        }
        qb.andWhere(`(
      EXISTS (
        SELECT 1 FROM "Rap"."ReceivedChequeOperationItem" rcoi
        WHERE rcoi."ReceiptChequeRef" = rc."ReceiptChequeID"
        AND rcoi."ChequeStatus" = 2
      )
      OR
      EXISTS (
        SELECT 1 FROM "Rap"."ReceiptReturnedPaymentAssignment" rrpa
        INNER JOIN "Rap"."PaymentAssignment" pa ON pa."PaymentAssignmentID" = rrpa."PaymentAssignmentRef"
        WHERE pa."ReceiptChequeRef" = rc."ReceiptChequeID"
      )
    )`);
        const cheques = await qb.getMany();
        const chequeIds = cheques.map(c => c.receiptChequeId);
        let protestedIds = new Set();
        let returnedIds = new Set();
        if (chequeIds.length > 0) {
            const protested = await this.typeOrmRepo.manager.query(`SELECT "ReceiptChequeRef" FROM "Rap"."ReceivedChequeOperationItem" WHERE "ReceiptChequeRef" = ANY($1) AND "ChequeStatus" = 2`, [chequeIds]);
            protested.forEach((p) => protestedIds.add(Number(p.ReceiptChequeRef)));
            const returned = await this.typeOrmRepo.manager.query(`SELECT pa."ReceiptChequeRef" FROM "Rap"."ReceiptReturnedPaymentAssignment" rrpa
         INNER JOIN "Rap"."PaymentAssignment" pa ON pa."PaymentAssignmentID" = rrpa."PaymentAssignmentRef"
         WHERE pa."ReceiptChequeRef" = ANY($1)`, [chequeIds]);
            returned.forEach((p) => returnedIds.add(Number(p.ReceiptChequeRef)));
        }
        return cheques.map(c => ({
            type: protestedIds.has(c.receiptChequeId) ? 'واخواست شده' : (returnedIds.has(c.receiptChequeId) ? 'برگشت واگذار به غیر' : ''),
            chequeNumber: c.chequeNumber,
            chequeDate: c.receiptNotification?.documentDate
                ? (0, moment_jalaali_1.default)(c.receiptNotification.documentDate).format('jYYYY/jMM/jDD')
                : '',
            partyName: c.receiptNotification?.party?.title || c.receiptNotification?.party?.partyName || (c.receiptNotification?.party?.firstName ? `${c.receiptNotification.party.firstName} ${c.receiptNotification.party.lastName || ''}` : ''),
            amount: c.amount,
            accountNumber: c.accountNumber || '',
            bankName: c.bank?.title || '',
            id: c.receiptChequeId,
            receiptNotificationRef: c.receiptNotificationRef,
            endorsement_number: c.endorsementNumber || '',
            sayad_code: c.sayyadNumber || '',
        }));
    }
    async getReturnablePromissoryNotes(businessStructureId, companyId, partyRef, excludeIds) {
        const { ReceiptPromissoryNote } = require('../../domain/entities/receipt-promissory-note.entity');
        const { PaymentReturnedReceivedPromissoryNote } = require('../../domain/entities/payment-returned-received-promissory-note.entity');
        const qb = this.typeOrmRepo.manager.createQueryBuilder(ReceiptPromissoryNote, 'rp')
            .leftJoinAndSelect('rp.receiptNotification', 'rn')
            .leftJoinAndSelect('rn.party', 'party')
            .leftJoinAndSelect('rn.currency', 'currency')
            .leftJoinAndSelect('rp.accountingSetting', 'as')
            .leftJoinAndSelect('rp.reason', 'reason')
            .where('rp.companyRef = :companyId', { companyId })
            .andWhere('rp.businessStructureRef = :businessStructureId', { businessStructureId });
        if (partyRef) {
            qb.andWhere('rn.partyRef = :partyRef', { partyRef });
        }
        if (excludeIds) {
            const ids = excludeIds.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
            if (ids.length > 0) {
                qb.andWhere('rp.receiptPromissoryNoteId NOT IN (:...excludeIds)', { excludeIds: ids });
            }
        }
        qb.andWhere(subQueryBuilder => {
            const subQuery = subQueryBuilder.subQuery()
                .select('prn.receiptPromissoryNoteRef')
                .from(PaymentReturnedReceivedPromissoryNote, 'prn')
                .where('prn.receiptPromissoryNoteRef = rp.receiptPromissoryNoteId')
                .getQuery();
            return `NOT EXISTS ${subQuery}`;
        });
        const notes = await qb.getMany();
        return notes.map((c) => ({
            promissoryNoteNumber: c.promissoryNoteNumber,
            dueDate: c.receiptNotification?.documentDate
                ? (0, moment_jalaali_1.default)(c.receiptNotification.documentDate).format('jYYYY/jMM/jDD')
                : '',
            partyName: c.receiptNotification?.party?.title || c.receiptNotification?.party?.partyName || (c.receiptNotification?.party?.firstName ? `${c.receiptNotification.party.firstName} ${c.receiptNotification.party.lastName || ''}` : ''),
            amount: c.amount,
            opTitle: c.accountingSetting?.title || '',
            opId: c.accountingSetting?.recieptAndPaymentAccountingSettingId || null,
            reasonTitle: c.reason?.Title || c.reason?.title || '',
            reasonId: c.reason?.RapReasonID || null,
            id: c.receiptPromissoryNoteId,
            receiptNotificationRef: c.receiptNotificationRef
        }));
    }
    async getPaidChequesByParty(businessStructureId, companyId, partyRef) {
        const { PaymentCheque } = require('../../domain/entities/payment-cheque.entity');
        const { PaymentNotification } = require('../../domain/entities/payment-notification.entity');
        const qb = this.typeOrmRepo.manager.createQueryBuilder(PaymentCheque, 'pc')
            .leftJoinAndSelect('pc.paymentNotification', 'pn')
            .leftJoinAndSelect('pc.accountingSetting', 'as')
            .leftJoinAndSelect('pc.reason', 'reason')
            .leftJoinAndSelect('pc.bankAccount', 'ba')
            .leftJoinAndSelect('pc.chequebook', 'cb')
            .where('pn.companyRef = :companyId', { companyId })
            .andWhere('pn.businessStructureRef = :businessStructureId', { businessStructureId });
        if (partyRef) {
            qb.andWhere('pn.partyRef = :partyRef', { partyRef });
        }
        const { ReceiptReturnedPaidCheque } = require('../../domain/entities/receipt-returned-paid-cheque.entity');
        const { PaidDocumentClearingItem } = require('../../domain/entities/paid-document-clearing-item.entity');
        qb.andWhere(subQueryBuilder => {
            const subQuery = subQueryBuilder.subQuery()
                .select('rc.paymentChequeRef')
                .from(ReceiptReturnedPaidCheque, 'rc')
                .where('rc.paymentChequeRef = pc.paymentChequeId')
                .getQuery();
            return `NOT EXISTS ${subQuery}`;
        });
        qb.andWhere(subQueryBuilder => {
            const subQuery = subQueryBuilder.subQuery()
                .select('pdci.documentId')
                .from(PaidDocumentClearingItem, 'pdci')
                .where('pdci.documentId = pc.paymentChequeId')
                .andWhere("pdci.documentType = 'cheque'")
                .getQuery();
            return `NOT EXISTS ${subQuery}`;
        });
        const cheques = await qb.getMany();
        return cheques.map((c) => ({
            chequeNumber: c.chequeNumber,
            transferChequeDate: c.paymentNotification?.documentDate
                ? (0, moment_jalaali_1.default)(c.paymentNotification.documentDate).format('jYYYY/jMM/jDD')
                : '',
            partyName: c.paymentNotification?.party?.title || c.paymentNotification?.party?.partyName || (c.paymentNotification?.party?.firstName ? `${c.paymentNotification.party.firstName} ${c.paymentNotification.party.lastName || ''}` : ''),
            amount: c.amount,
            bankName: c.bankAccount?.bank?.title || c.chequebook?.bank?.title || '',
            branchName: c.bankAccount?.branch?.title || c.chequebook?.bankBranch?.title || '',
            opCode: c.accountingSetting?.code || '',
            opTitle: c.accountingSetting?.title || '',
            opId: c.accountingSetting?.recieptAndPaymentAccountingSettingId || null,
            reasonTitle: c.reason?.Title || c.reason?.title || '',
            reasonId: c.reason?.RapReasonID || null,
            description: c.description || '',
            id: c.paymentChequeId,
            currency: c.paymentNotification?.currency?.title || 'ریال',
            endorsement_number: c.chequeNumber || '',
            sayad_code: c.chequeNumber || '',
        }));
    }
    async getPaidPromissoryNotesByParty(businessStructureId, companyId, partyRef) {
        const { PaymentPromissoryNote } = require('../../domain/entities/payment-promissory-note.entity');
        const { PaymentNotification } = require('../../domain/entities/payment-notification.entity');
        const { ReceiptReturnedPaymentPromissoryNote } = require('../../domain/entities/receipt-returned-payment-promissory-note.entity');
        const qb = this.typeOrmRepo.manager.createQueryBuilder(PaymentPromissoryNote, 'ppn')
            .leftJoinAndSelect('ppn.paymentNotification', 'pn')
            .leftJoinAndSelect('ppn.accountingSetting', 'as')
            .leftJoinAndSelect('ppn.reason', 'reason')
            .leftJoinAndSelect('ppn.promissoryNoteItem', 'pni')
            .where('pn.companyRef = :companyId', { companyId })
            .andWhere('pn.businessStructureRef = :businessStructureId', { businessStructureId });
        if (partyRef) {
            qb.andWhere('pn.partyRef = :partyRef', { partyRef });
        }
        qb.andWhere(subQueryBuilder => {
            const subQuery = subQueryBuilder.subQuery()
                .select('rc.paymentPromissoryNoteRef')
                .from(ReceiptReturnedPaymentPromissoryNote, 'rc')
                .where('rc.paymentPromissoryNoteRef = ppn.paymentPromissoryNoteId')
                .getQuery();
            return `NOT EXISTS ${subQuery}`;
        });
        const notes = await qb.getMany();
        return notes.map((n) => ({
            promissoryNoteNumber: n.promissoryNoteItem?.promissoryNoteNumber || '',
            promissoryNoteValue: n.promissoryNoteItem?.value || n.amount,
            dueDate: n.dueDate ? (0, moment_jalaali_1.default)(n.dueDate).format('jYYYY/jMM/jDD') : '',
            amount: n.amount,
            opCode: n.accountingSetting?.code || '',
            opTitle: n.accountingSetting?.title || '',
            opId: n.accountingSetting?.recieptAndPaymentAccountingSettingId || null,
            reasonTitle: n.reason?.Title || n.reason?.title || '',
            reasonId: n.reason?.RapReasonID || null,
            paymentNotificationNumber: n.paymentNotification?.documentNumber || '',
            paymentNotificationDate: n.paymentNotification?.documentDate ? (0, moment_jalaali_1.default)(n.paymentNotification.documentDate).format('jYYYY/jMM/jDD') : '',
            id: n.paymentPromissoryNoteId,
        }));
    }
    async create(data, businessStructureId, companyId) {
        const id = await this.idGenService.generateNextId('ReceiptNotification');
        const entity = this.typeOrmRepo.create({
            receiptNotificationId: id,
            documentNumber: data.documentNumber,
            documentDate: formatDateToLocalYYYYMMDD(data.documentDate),
            partyRef: data.partyRef,
            currencyRef: data.currencyRef,
            voucherHeaderRef: data.voucherHeaderRef,
            exchangeRate: data.exchangeRate,
            reasonRef: data.reasonRef,
            description: data.description,
            status: data.status ?? 1,
            fiscalYearRef: data.fiscalYearRef ?? 1,
            businessStructureRef: businessStructureId,
            companyRef: companyId,
            cashItems: [],
            chequeItems: [],
            depositItems: [],
        });
        if (data.returnedPaymentPromissoryNotes && data.returnedPaymentPromissoryNotes.length > 0) {
            const { ReceiptReturnedPaymentPromissoryNote } = require('../../domain/entities/receipt-returned-payment-promissory-note.entity');
            const startId = await this.idGenService.generateNextIdBlock('ReceiptReturnedPaymentPromissoryNote', data.returnedPaymentPromissoryNotes.length);
            let currentId = startId;
            entity.returnedPaymentPromissoryNotes = [];
            for (const item of data.returnedPaymentPromissoryNotes) {
                const returnedObjId = currentId++;
                entity.returnedPaymentPromissoryNotes.push({
                    receiptReturnedPaymentPromissoryNoteId: returnedObjId,
                    receiptNotificationRef: id,
                    paymentPromissoryNoteRef: item.paymentPromissoryNoteRef,
                    accountingSettingRef: item.accountingSettingRef,
                    amount: item.amount,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.returnedPaymentChequesItems && data.returnedPaymentChequesItems.length > 0) {
            const { ReceiptReturnedPaidCheque } = require('../../domain/entities/receipt-returned-paid-cheque.entity');
            const startId = await this.idGenService.generateNextIdBlock('ReceiptReturnedPaidCheque', data.returnedPaymentChequesItems.length);
            let currentId = startId;
            entity.returnedPaidCheques = [];
            for (const item of data.returnedPaymentChequesItems) {
                const returnedChequeItemId = currentId++;
                entity.returnedPaidCheques.push({
                    receiptReturnedPaidChequeId: returnedChequeItemId,
                    receiptNotificationRef: id,
                    paymentChequeRef: item.paymentChequeRef,
                    accountingSettingRef: item.accountingSettingRef,
                    amount: item.amount,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.returnedPaymentAssignments && data.returnedPaymentAssignments.length > 0) {
            const { ReceiptReturnedPaymentAssignment } = require('../../domain/entities/receipt-returned-payment-assignment.entity');
            const startId = await this.idGenService.generateNextIdBlock('ReceiptReturnedPaymentAssignment', data.returnedPaymentAssignments.length);
            let currentId = startId;
            entity.returnedPaymentAssignments = [];
            for (const item of data.returnedPaymentAssignments) {
                const returnedAssignmentItemId = currentId++;
                entity.returnedPaymentAssignments.push({
                    receiptReturnedPaymentAssignmentId: returnedAssignmentItemId,
                    receiptNotificationRef: id,
                    paymentAssignmentRef: item.paymentAssignmentRef,
                    cashRef: item.cashRef,
                    accountingSettingRef: item.accountingSettingRef,
                    amount: item.amount,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.depositItems && data.depositItems.length > 0) {
            const startId = await this.idGenService.generateNextIdBlock('ReceiptDeposit', data.depositItems.length);
            let currentId = startId;
            for (const item of data.depositItems) {
                const withdrawalItemId = currentId++;
                entity.depositItems.push({
                    receiptDepositId: withdrawalItemId,
                    receiptNotificationRef: id,
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
            const startId = await this.idGenService.generateNextIdBlock('ReceiptCash', data.cashItems.length);
            let currentId = startId;
            for (const item of data.cashItems) {
                const cashItemId = currentId++;
                entity.cashItems.push({
                    receiptCashId: cashItemId,
                    receiptNotificationRef: id,
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
            const startId = await this.idGenService.generateNextIdBlock('ReceiptCheque', data.chequeItems.length);
            let currentId = startId;
            const chequeChecks = data.chequeItems.filter(item => item.chequeNumber).map(async (item) => {
                const existingCheque = await this.typeOrmRepo.manager.getRepository(receipt_cheque_entity_1.ReceiptCheque).findOne({
                    where: {
                        chequeNumber: item.chequeNumber,
                        bankRef: item.bankRef,
                        companyRef: companyId,
                    }
                });
                if (existingCheque) {
                    throw new common_1.BadRequestException(`چک به شماره ${item.chequeNumber} قبلاً در سیستم استفاده شده است.`);
                }
            });
            await Promise.all(chequeChecks);
            for (const item of data.chequeItems) {
                const chequeItemId = currentId++;
                entity.chequeItems.push({
                    receiptChequeId: chequeItemId,
                    receiptNotificationRef: id,
                    cashRef: item.cashRef,
                    accountingSettingRef: item.accountingSettingRef,
                    bankRef: item.bankRef,
                    accountNumber: item.accountNumber,
                    branchName: item.branchName,
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
            }
        }
        if (data.promissoryNoteItems && data.promissoryNoteItems.length > 0) {
            const startId = await this.idGenService.generateNextIdBlock('ReceiptPromissoryNote', data.promissoryNoteItems.length);
            let currentId = startId;
            entity.promissoryNoteItems = [];
            for (const item of data.promissoryNoteItems) {
                const itemId = currentId++;
                entity.promissoryNoteItems.push({
                    receiptPromissoryNoteId: itemId,
                    receiptNotificationRef: id,
                    promissoryNoteNumber: item.promissoryNoteNumber,
                    promissoryNoteValue: item.promissoryNoteValue,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    cashRef: item.cashRef,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.guaranteeItems && data.guaranteeItems.length > 0) {
            const startId = await this.idGenService.generateNextIdBlock("ReceiptGuarantee", data.guaranteeItems.length);
            let currentId = startId;
            entity.guaranteeItems = [];
            for (const item of data.guaranteeItems) {
                const itemId = currentId++;
                entity.guaranteeItems.push({
                    receiptGuaranteeId: itemId,
                    receiptNotificationRef: id,
                    guaranteeNumber: item.guaranteeNumber,
                    guaranteeType: item.guaranteeType,
                    baseDocument: item.baseDocument,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    cashRef: item.cashRef,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    bankRef: item.bankRef,
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
        if (data.reasonRef !== undefined)
            existing.reasonRef = data.reasonRef;
        if (data.description !== undefined)
            existing.description = data.description;
        if (data.status !== undefined)
            existing.status = data.status;
        if (data.fiscalYearRef !== undefined)
            existing.fiscalYearRef = data.fiscalYearRef;
        if (data.returnedPaymentChequesItems) {
            const { ReceiptReturnedPaidCheque } = require('../../domain/entities/receipt-returned-paid-cheque.entity');
            if (existing.returnedPaidCheques && existing.returnedPaidCheques.length > 0) {
                await this.typeOrmRepo.manager.delete(ReceiptReturnedPaidCheque, { receiptNotificationRef: id });
            }
            existing.returnedPaidCheques = [];
            const newReturnedChequesCount = data.returnedPaymentChequesItems.filter((item) => !item.receiptReturnedPaidChequeId).length;
            let returnedChequesNextId = newReturnedChequesCount > 0 ? await this.idGenService.generateNextIdBlock('ReceiptReturnedPaidCheque', newReturnedChequesCount) : 0;
            for (const item of data.returnedPaymentChequesItems) {
                const returnedChequeItemId = item.receiptReturnedPaidChequeId || returnedChequesNextId++;
                existing.returnedPaidCheques.push({
                    receiptReturnedPaidChequeId: returnedChequeItemId,
                    receiptNotificationRef: id,
                    paymentChequeRef: item.paymentChequeRef,
                    cashRef: item.cashRef,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.returnedPaymentAssignments) {
            const { ReceiptReturnedPaymentAssignment } = require('../../domain/entities/receipt-returned-payment-assignment.entity');
            if (existing.returnedPaymentAssignments && existing.returnedPaymentAssignments.length > 0) {
                await this.typeOrmRepo.manager.delete(ReceiptReturnedPaymentAssignment, { receiptNotificationRef: id });
            }
            existing.returnedPaymentAssignments = [];
            const newReturnedAssignmentsCount = data.returnedPaymentAssignments.filter((item) => !item.receiptReturnedPaymentAssignmentId).length;
            let returnedAssignmentsNextId = newReturnedAssignmentsCount > 0 ? await this.idGenService.generateNextIdBlock('ReceiptReturnedPaymentAssignment', newReturnedAssignmentsCount) : 0;
            for (const item of data.returnedPaymentAssignments) {
                const reqId = item.receiptReturnedPaymentAssignmentId || returnedAssignmentsNextId++;
                existing.returnedPaymentAssignments.push({
                    receiptReturnedPaymentAssignmentId: reqId,
                    receiptNotificationRef: id,
                    paymentAssignmentRef: item.paymentAssignmentRef,
                    cashRef: item.cashRef,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.returnedPaymentPromissoryNotes) {
            const { ReceiptReturnedPaymentPromissoryNote } = require('../../domain/entities/receipt-returned-payment-promissory-note.entity');
            if (existing.returnedPaymentPromissoryNotes && existing.returnedPaymentPromissoryNotes.length > 0) {
                await this.typeOrmRepo.manager.delete(ReceiptReturnedPaymentPromissoryNote, { receiptNotificationRef: id });
            }
            existing.returnedPaymentPromissoryNotes = [];
            const newItemsCount = data.returnedPaymentPromissoryNotes.filter((item) => !item.receiptReturnedPaymentPromissoryNoteId).length;
            let nextId = newItemsCount > 0 ? await this.idGenService.generateNextIdBlock('ReceiptReturnedPaymentPromissoryNote', newItemsCount) : 0;
            for (const item of data.returnedPaymentPromissoryNotes) {
                const reqId = item.receiptReturnedPaymentPromissoryNoteId || nextId++;
                existing.returnedPaymentPromissoryNotes.push({
                    receiptReturnedPaymentPromissoryNoteId: reqId,
                    receiptNotificationRef: id,
                    paymentPromissoryNoteRef: item.paymentPromissoryNoteRef,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.cashItems) {
            if (existing.cashItems && existing.cashItems.length > 0) {
                await this.typeOrmRepo.manager.delete(receipt_cash_entity_1.ReceiptCash, { receiptNotificationRef: id });
            }
            existing.cashItems = [];
            const newCashItemsCount = data.cashItems.filter(item => !item.receiptCashId).length;
            let cashItemsNextId = newCashItemsCount > 0 ? await this.idGenService.generateNextIdBlock('ReceiptCash', newCashItemsCount) : 0;
            for (const item of data.cashItems) {
                const cashItemId = item.receiptCashId || cashItemsNextId++;
                existing.cashItems.push({
                    receiptCashId: cashItemId,
                    receiptNotificationRef: id,
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
            const chequeChecks = data.chequeItems.filter(item => item.chequeNumber).map(async (item) => {
                const existingChequeQuery = this.typeOrmRepo.manager.createQueryBuilder(receipt_cheque_entity_1.ReceiptCheque, 'pc')
                    .where('pc.chequeNumber = :chequeNumber', { chequeNumber: item.chequeNumber })
                    .andWhere('pc.bankRef = :bankRef', { bankRef: item.bankRef })
                    .andWhere('pc.companyRef = :companyId', { companyId })
                    .andWhere('pc.receiptNotificationRef != :id', { id });
                const existingCheque = await existingChequeQuery.getOne();
                if (existingCheque) {
                    throw new common_1.BadRequestException(`چک به شماره ${item.chequeNumber} قبلاً در سیستم برای دریافت دیگری استفاده شده است.`);
                }
            });
            await Promise.all(chequeChecks);
            if (existing.chequeItems && existing.chequeItems.length > 0) {
                await this.typeOrmRepo.manager.delete(receipt_cheque_entity_1.ReceiptCheque, { receiptNotificationRef: id });
            }
            existing.chequeItems = [];
            const newChequeItemsCount = data.chequeItems.filter(item => !item.receiptChequeId).length;
            let chequeItemsNextId = newChequeItemsCount > 0 ? await this.idGenService.generateNextIdBlock('ReceiptCheque', newChequeItemsCount) : 0;
            for (const item of data.chequeItems) {
                const chequeItemId = item.receiptChequeId || chequeItemsNextId++;
                existing.chequeItems.push({
                    receiptChequeId: chequeItemId,
                    receiptNotificationRef: id,
                    cashRef: item.cashRef,
                    accountingSettingRef: item.accountingSettingRef,
                    bankRef: item.bankRef,
                    branchName: item.branchName,
                    accountNumber: item.accountNumber,
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
            }
        }
        if (data.depositItems) {
            if (existing.depositItems && existing.depositItems.length > 0) {
                await this.typeOrmRepo.manager.delete(receipt_deposit_entity_1.ReceiptDeposit, { receiptNotificationRef: id });
            }
            existing.depositItems = [];
            const newDepositItemsCount = data.depositItems.filter(item => !item.receiptDepositId).length;
            let depositItemsNextId = newDepositItemsCount > 0 ? await this.idGenService.generateNextIdBlock('ReceiptDeposit', newDepositItemsCount) : 0;
            for (const item of data.depositItems) {
                const withdrawalItemId = item.receiptDepositId || depositItemsNextId++;
                existing.depositItems.push({
                    receiptDepositId: withdrawalItemId,
                    receiptNotificationRef: id,
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
        if (data.promissoryNoteItems) {
            const { ReceiptPromissoryNote } = require('../../domain/entities/receipt-promissory-note.entity');
            if (existing.promissoryNoteItems && existing.promissoryNoteItems.length > 0) {
                await this.typeOrmRepo.manager.delete(ReceiptPromissoryNote, { receiptNotificationRef: id });
            }
            existing.promissoryNoteItems = [];
            const newItemsCount = data.promissoryNoteItems.filter(item => !item.receiptPromissoryNoteId).length;
            let nextId = newItemsCount > 0 ? await this.idGenService.generateNextIdBlock('ReceiptPromissoryNote', newItemsCount) : 0;
            for (const item of data.promissoryNoteItems) {
                const itemId = item.receiptPromissoryNoteId || nextId++;
                existing.promissoryNoteItems.push({
                    receiptPromissoryNoteId: itemId,
                    receiptNotificationRef: id,
                    promissoryNoteNumber: item.promissoryNoteNumber,
                    promissoryNoteValue: item.promissoryNoteValue,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    cashRef: item.cashRef,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                });
            }
        }
        if (data.guaranteeItems) {
            const { ReceiptGuarantee } = require("../../domain/entities/receipt-guarantee.entity");
            if (existing.guaranteeItems && existing.guaranteeItems.length > 0) {
                await this.typeOrmRepo.manager.delete(ReceiptGuarantee, { receiptNotificationRef: id });
            }
            existing.guaranteeItems = [];
            const newItemsCount = data.guaranteeItems.filter(item => !item.receiptGuaranteeId).length;
            let nextId = newItemsCount > 0 ? await this.idGenService.generateNextIdBlock("ReceiptGuarantee", newItemsCount) : 0;
            for (const item of data.guaranteeItems) {
                const itemId = item.receiptGuaranteeId || nextId++;
                existing.guaranteeItems.push({
                    receiptGuaranteeId: itemId,
                    receiptNotificationRef: id,
                    guaranteeNumber: item.guaranteeNumber,
                    guaranteeType: item.guaranteeType,
                    baseDocument: item.baseDocument,
                    amount: item.amount,
                    accountingSettingRef: item.accountingSettingRef,
                    cashRef: item.cashRef,
                    description: item.description,
                    reasonRef: item.reasonRef,
                    bankRef: item.bankRef,
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
            await this.typeOrmRepo.remove(existing);
        }
    }
};
exports.ReceiptNotificationRepository = ReceiptNotificationRepository;
exports.ReceiptNotificationRepository = ReceiptNotificationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(receipt_notification_entity_1.ReceiptNotification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService])
], ReceiptNotificationRepository);
//# sourceMappingURL=receipt-notification.repository.js.map
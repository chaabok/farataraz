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
exports.PaidDocumentClearingRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
const paid_document_clearing_entity_1 = require("../../domain/entities/paid-document-clearing.entity");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
let PaidDocumentClearingRepository = class PaidDocumentClearingRepository {
    constructor(repo) {
        this.repo = repo;
    }
    get manager() {
        return this.repo.manager;
    }
    async create(data) {
        const entity = this.repo.create(data);
        return await this.repo.save(entity);
    }
    async update(id, data) {
        const existing = await this.repo.findOne({ where: { paidDocumentClearingId: id } });
        if (!existing) {
            throw new Error('Record not found.');
        }
        await this.repo.save({ ...existing, ...data });
    }
    async delete(id) {
        await this.repo.delete(id);
    }
    async findById(id) {
        return await this.repo.findOne({
            where: { paidDocumentClearingId: id },
            relations: ['voucherHeader']
        });
    }
    async findAll() {
        return await this.repo.find();
    }
    async findAdvanced(params) {
        let query = this.repo.createQueryBuilder('e');
        query = (0, typeorm_query_builder_1.applyDataGridParams)(query, params, 'e');
        if (params?.skip !== undefined)
            query = query.skip(params.skip);
        if (params?.take !== undefined)
            query = query.take(params.take);
        return await query.getManyAndCount();
    }
    async checkDuplicate(field, value, excludeId) {
        const qb = this.repo.createQueryBuilder('e').where(`e.${field} = :value`, { value });
        if (excludeId) {
            qb.andWhere(`e.paidDocumentClearingId != :id`, { id: excludeId });
        }
        const count = await qb.getCount();
        return count > 0;
    }
    async calculateNextDocumentNumber(dateStr, businessStructureId, companyId) {
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
        let query = this.repo.createQueryBuilder('p')
            .where('p.companyRef = :companyId', { companyId })
            .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });
        if (hasFiscalYearCheck) {
            const startJ = `${year}/01/01`;
            const endJ = `${parseInt(year, 10) + 1}/01/01`;
            const startDate = (0, moment_jalaali_1.default)(startJ, 'jYYYY/jMM/jDD').toDate();
            const endDate = (0, moment_jalaali_1.default)(endJ, 'jYYYY/jMM/jDD').toDate();
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
    async findAllCustom(filters) {
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
            query = (0, typeorm_query_builder_1.applyDataGridParams)(query, filters, 'p');
        }
        query = query.orderBy('p.creationDate', 'DESC');
        if (filters?.skip !== undefined)
            query = query.skip(filters.skip);
        if (filters?.take !== undefined)
            query = query.take(filters.take);
        return await query.getManyAndCount();
    }
    async findByIdCustom(id) {
        const clearing = await this.repo.findOne({
            where: { paidDocumentClearingId: id },
            relations: ['items', 'bankAccount', 'voucherHeader']
        });
        if (clearing && clearing.items) {
            for (const item of clearing.items) {
                if (item.documentType === 'cheque' && item.documentId) {
                    const rawData = await this.repo.manager.query(`
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
            `, [item.documentId]);
                    if (rawData && rawData.length > 0) {
                        item.document = rawData[0];
                    }
                }
                else if (item.documentType === 'promissory_note' && item.documentId) {
                    const rawData = await this.repo.manager.query(`
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
            `, [item.documentId]);
                    if (rawData && rawData.length > 0) {
                        item.document = rawData[0];
                    }
                }
            }
        }
        if (clearing && clearing.bankAccount) {
            clearing.bank_account = {
                id: clearing.bankAccount.bankAccountId,
                bankAccountId: clearing.bankAccount.bankAccountId,
                title: clearing.bankAccount.title
            };
        }
        return clearing;
    }
};
exports.PaidDocumentClearingRepository = PaidDocumentClearingRepository;
exports.PaidDocumentClearingRepository = PaidDocumentClearingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(paid_document_clearing_entity_1.PaidDocumentClearing)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaidDocumentClearingRepository);
//# sourceMappingURL=paid-document-clearing.repository.js.map
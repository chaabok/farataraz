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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PettyCashRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const petty_cash_entity_1 = require("../../domain/entities/petty-cash.entity");
let PettyCashRepository = class PettyCashRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async calculateCurrentBalance(pettyCash, fiscalYearId) {
        if (!pettyCash.partyRef)
            return;
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
    async findAll(companyId, businessStructureId, fiscalYearId) {
        let isShared = true;
        try {
            const rows = await this.repository.manager.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [businessStructureId]);
            if (rows && rows.length > 0) {
                if (rows.some((r) => {
                    const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                    return val === false || val === 0 || val === 'false' || val === null;
                })) {
                    isShared = false;
                }
            }
            else {
                isShared = false;
            }
        }
        catch (err) {
            isShared = false;
        }
        const where = isShared ? { businessStructureRef: businessStructureId } : { companyRef: companyId };
        const records = await this.repository.find({
            where,
            relations: ['party', 'account', 'currency'],
            order: { pettyCashId: 'ASC' },
        });
        await Promise.all(records.map(r => this.calculateCurrentBalance(r, fiscalYearId)));
        return records;
    }
    async findById(id, fiscalYearId) {
        const record = await this.repository.findOne({
            where: { pettyCashId: id },
            relations: ['account', 'party', 'currency']
        });
        if (record) {
            await this.calculateCurrentBalance(record, fiscalYearId);
        }
        return record;
    }
    async create(entity) {
        if (!entity.businessStructureRef || entity.businessStructureRef <= 1)
            entity.businessStructureRef = 2;
        if (!entity.companyRef || entity.companyRef <= 1)
            entity.companyRef = 2;
        return this.repository.save(entity);
    }
    async update(entity) {
        return this.repository.save(entity);
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async isUsed(id) {
        return false;
    }
};
exports.PettyCashRepository = PettyCashRepository;
exports.PettyCashRepository = PettyCashRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(petty_cash_entity_1.PettyCash)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PettyCashRepository);
//# sourceMappingURL=petty-cash.repository.js.map
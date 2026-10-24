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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankReconciliationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const bank_reconciliation_entity_1 = require("../../domain/entities/bank-reconciliation.entity");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
let BankReconciliationRepository = class BankReconciliationRepository extends typeorm_1.Repository {
    constructor(dataSource) {
        super(bank_reconciliation_entity_1.BankReconciliation, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async calculateNextDocumentNumber(dateStr, businessStructureId, companyId) {
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
        let config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
            where: {
                entityRef: 'bank_reconciliation',
                companyRef: companyId,
            }
        });
        if (!config) {
            config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                where: {
                    entityRef: 'bank_reconciliation',
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
        let query = this.createQueryBuilder('p')
            .where('p.companyRef = :companyId', { companyId })
            .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });
        if (hasFiscalYearCheck) {
            const startJ = `${year}/01/01`;
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
            }
            else {
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
};
exports.BankReconciliationRepository = BankReconciliationRepository;
exports.BankReconciliationRepository = BankReconciliationRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], BankReconciliationRepository);
//# sourceMappingURL=bank-reconciliation.repository.js.map
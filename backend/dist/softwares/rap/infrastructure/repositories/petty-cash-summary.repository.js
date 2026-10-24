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
exports.PettyCashSummaryRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const petty_cash_summary_entity_1 = require("../../domain/entities/petty-cash-summary.entity");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
let PettyCashSummaryRepository = class PettyCashSummaryRepository {
    constructor(repository, requestContextService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        const compId = this.requestContextService.getCompanyId() ?? 2;
        const fiscalYearId = this.requestContextService.getFiscalYearId() ?? 1;
        return { bsId, compId, fiscalYearId };
    }
    async getBuilder() {
        const { bsId, compId, fiscalYearId } = await this.getScope();
        const qb = this.repository.createQueryBuilder('summary')
            .leftJoinAndSelect('summary.pettyCash', 'pettyCash')
            .leftJoinAndSelect('pettyCash.party', 'pettyCashParty')
            .leftJoinAndSelect('pettyCashParty.detailedAccount', 'detailedAccount')
            .leftJoinAndSelect('summary.items', 'items')
            .leftJoinAndSelect('items.reason', 'reason')
            .leftJoinAndSelect('summary.voucherHeader', 'voucherHeader')
            .where('summary.businessStructureRef = :bsId', { bsId })
            .andWhere('summary.companyRef = :compId', { compId })
            .andWhere('summary.fiscalYearRef = :fiscalYearId', { fiscalYearId });
        return qb;
    }
    async findAll(options) {
        const qb = await this.getBuilder();
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, options, 'summary');
        return qb.getManyAndCount();
    }
    async findById(id) {
        const qb = await this.getBuilder();
        return qb.andWhere('summary.pettyCashSummaryId = :id', { id }).getOne();
    }
    async create(entity) {
        return this.repository.save(entity);
    }
    async update(id, entity) {
        await this.repository.update({ pettyCashSummaryId: id }, entity);
        return this.findById(id);
    }
    async delete(id) {
        await this.repository.delete({ pettyCashSummaryId: id });
    }
    async isUsed(id) {
        return false;
    }
    async calculateNextDocumentNumber(dateStr, businessStructureId, companyId) {
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
        let config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
            where: {
                entityRef: 'petty_cash_summary',
                companyRef: companyId,
            }
        });
        if (!config) {
            config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                where: {
                    entityRef: 'petty_cash_summary',
                    businessStructureRef: businessStructureId,
                }
            });
        }
        let numberingMethod = '2';
        let items = null;
        let baseNumbering = ['fiscalYear'];
        if (config) {
            numberingMethod = config.numberingMethod || '2';
            items = config.items;
            baseNumbering = Array.isArray(config.baseNumbering) ? config.baseNumbering : ['fiscalYear'];
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
        let query = this.repository.createQueryBuilder('p')
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
            .orderBy('LENGTH(CAST(p.number AS VARCHAR))', 'DESC')
            .addOrderBy('CAST(p.number AS VARCHAR)', 'DESC')
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
};
exports.PettyCashSummaryRepository = PettyCashSummaryRepository;
exports.PettyCashSummaryRepository = PettyCashSummaryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(petty_cash_summary_entity_1.PettyCashSummary)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], PettyCashSummaryRepository);
//# sourceMappingURL=petty-cash-summary.repository.js.map
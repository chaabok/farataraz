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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PettyCashRequestRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const petty_cash_request_entity_1 = require("../../domain/entities/petty-cash-request.entity");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
let PettyCashRequestRepository = class PettyCashRequestRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repository = this.dataSource.getRepository(petty_cash_request_entity_1.PettyCashRequest);
    }
    async create(data) {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }
    async update(id, data) {
        await this.repository.update(id, data);
        return this.findById(id);
    }
    async findById(id) {
        return this.repository.findOne({
            where: { pettyCashRequestId: id },
            relations: ['pettyCash', 'pettyCash.party', 'pettyCash.currency', 'pettyCashSummary']
        });
    }
    async findAll(options) {
        const qb = this.repository.createQueryBuilder('request')
            .leftJoinAndSelect('request.pettyCash', 'pettyCash')
            .leftJoinAndSelect('pettyCash.party', 'party')
            .leftJoinAndSelect('pettyCash.currency', 'currency')
            .leftJoinAndSelect('request.pettyCashSummary', 'pettyCashSummary');
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, options, 'request');
        return qb.getManyAndCount();
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async generateNextNumber(businessStructureId, companyId, fiscalYearId) {
        const result = await this.repository.createQueryBuilder('request')
            .select('request.requestNumber', 'number')
            .where('request.businessStructureRef = :businessStructureId', { businessStructureId })
            .andWhere('request.companyRef = :companyId', { companyId })
            .andWhere('request.fiscalYearRef = :fiscalYearId', { fiscalYearId })
            .orderBy('LENGTH(request.requestNumber)', 'DESC')
            .addOrderBy('request.requestNumber', 'DESC')
            .getRawOne();
        const maxVal = result?.number ? parseInt(String(result.number).replace(/\D/g, ''), 10) : 0;
        return String(maxVal + 1);
    }
    async calculateNextDocumentNumber(dateStr, businessStructureId, companyId) {
        try {
            const manager = this.repository.manager;
            let year = (0, moment_jalaali_1.default)().format('jYYYY');
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
                where: { entityRef: 'petty_cash_request', companyRef: companyId }
            });
            if (!config) {
                config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                    where: { entityRef: 'petty_cash_request', businessStructureRef: businessStructureId }
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
                if (Array.isArray(items))
                    fYears = items;
                const matchYear = fYears.find((fy) => String(fy.fiscalYearTitle || fy.fiscalYear) === String(year));
                if (matchYear) {
                    startNumber = parseInt(matchYear.startNumber || '1', 10);
                    endNumber = parseInt(matchYear.endNumber || '999999', 10);
                    fixedChar = matchYear.fixedChar || '';
                }
            }
            const hasFiscalYearCheck = baseNumbering.includes('fiscalYear');
            const createBaseQuery = () => this.repository.createQueryBuilder('p')
                .where('p.companyRef = :companyId', { companyId })
                .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });
            let query = createBaseQuery();
            if (hasFiscalYearCheck) {
                const startJ = `${year}/01/01`;
                const endJ = `${parseInt(year, 10) + 1}/01/01`;
                const startDate = (0, moment_jalaali_1.default)(startJ, 'jYYYY/jMM/jDD').toDate();
                const endDate = (0, moment_jalaali_1.default)(endJ, 'jYYYY/jMM/jDD').toDate();
                query = query.andWhere('p.requestDate >= :startDate AND p.requestDate < :endDate', { startDate, endDate });
            }
            const lastRecord = await query
                .orderBy('LENGTH(CAST(p.requestNumber AS VARCHAR))', 'DESC')
                .addOrderBy('CAST(p.requestNumber AS VARCHAR)', 'DESC')
                .getOne();
            let nextSeq = startNumber;
            if (lastRecord && lastRecord.requestNumber) {
                const lastValStr = String(lastRecord.requestNumber);
                const prefixStr = String(fixedChar || '');
                if (prefixStr && lastValStr.startsWith(prefixStr)) {
                    const numPart = lastValStr.slice(prefixStr.length);
                    const parsed = parseInt(numPart.replace(/\D/g, ''), 10);
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
            if (nextSeq < startNumber)
                nextSeq = startNumber;
            if (nextSeq > endNumber) {
                return {
                    numberingMethod,
                    nextValue: '',
                    error: `شماره تولید شده (${nextSeq}) از شماره پایانی تعریف شده (${endNumber}) در روش شماره گذاری برای سال ${year} تجاوز کرده است.`
                };
            }
            const formatted = String(fixedChar || '') + String(nextSeq);
            return { numberingMethod, nextValue: formatted };
        }
        catch (error) {
            console.error("Error in calculateNextDocumentNumber:", error);
            return {
                numberingMethod: '2',
                nextValue: '',
                error: `خطای داخلی سرور در محاسبه شماره: ${error.message}`
            };
        }
    }
};
exports.PettyCashRequestRepository = PettyCashRequestRepository;
exports.PettyCashRequestRepository = PettyCashRequestRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], PettyCashRequestRepository);
//# sourceMappingURL=petty-cash-request.repository.js.map
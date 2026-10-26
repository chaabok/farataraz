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
exports.ReceivedChequeOperationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
const received_cheque_operation_entity_1 = require("../../domain/entities/received-cheque-operation.entity");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
let ReceivedChequeOperationRepository = class ReceivedChequeOperationRepository {
    constructor(repo) {
        this.repo = repo;
    }
    async create(data) {
        const entity = this.repo.create({
            ...data,
        });
        return await this.repo.save(entity);
    }
    async update(id, data) {
        const entity = await this.findById(id);
        if (!entity)
            throw new Error('ReceivedChequeOperation not found');
        if (data.items) {
            const { ReceivedChequeOperationItem } = require('../../domain/entities/received-cheque-operation-item.entity');
            await this.repo.manager.delete(ReceivedChequeOperationItem, { operationRef: id });
            entity.items = [];
        }
        Object.assign(entity, data);
        return await this.repo.save(entity);
    }
    async delete(id) {
        await this.repo.delete(id);
    }
    async findById(id) {
        return await this.repo.findOne({
            where: { receivedChequeOperationId: id },
            relations: [
                'items',
                'items.receiptCheque',
                'items.receiptCheque.receiptNotification',
                'items.receiptCheque.receiptNotification.party',
                'bankAccount',
                'realizer',
                'items.cash',
                'voucherHeader'
            ]
        });
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
                entityRef: 'received_cheque_operation',
                companyRef: companyId,
            }
        });
        if (!config) {
            config = await manager.getRepository(EntityNumbering).findOne({
                where: {
                    entityRef: 'received_cheque_operation',
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
    async findAll(filters) {
        let query = this.repo.createQueryBuilder('op')
            .leftJoinAndSelect('op.items', 'items')
            .leftJoinAndSelect('items.receiptCheque', 'receiptCheque')
            .leftJoinAndSelect('receiptCheque.receiptNotification', 'receiptNotification')
            .leftJoinAndSelect('receiptNotification.party', 'party')
            .leftJoinAndSelect('op.bankAccount', 'bankAccount')
            .leftJoinAndSelect('op.realizer', 'realizer')
            .leftJoinAndSelect('op.voucherHeader', 'voucherHeader');
        if (filters) {
            if (filters.companyRef) {
                query = query.andWhere('op.companyRef = :companyRef', { companyRef: filters.companyRef });
            }
            if (filters.businessStructureRef) {
                query = query.andWhere('op.businessStructureRef = :businessStructureRef', { businessStructureRef: filters.businessStructureRef });
            }
            if (filters.fiscalYearRef) {
                query = query.andWhere('op.fiscalYearRef = :fiscalYearRef', { fiscalYearRef: filters.fiscalYearRef });
            }
            query = (0, typeorm_query_builder_1.applyDataGridParams)(query, filters, 'op');
        }
        query = query.orderBy('op.creationDate', 'DESC');
        if (filters?.skip !== undefined)
            query = query.skip(filters.skip);
        if (filters?.take !== undefined)
            query = query.take(filters.take);
        return await query.getManyAndCount();
    }
};
exports.ReceivedChequeOperationRepository = ReceivedChequeOperationRepository;
exports.ReceivedChequeOperationRepository = ReceivedChequeOperationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(received_cheque_operation_entity_1.ReceivedChequeOperation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReceivedChequeOperationRepository);
//# sourceMappingURL=received-cheque-operation.repository.js.map
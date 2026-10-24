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
exports.VoucherService = void 0;
const common_1 = require("@nestjs/common");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const typeorm_1 = require("@nestjs/typeorm");
const voucher_item_entity_1 = require("../../domain/entities/voucher-item.entity");
const voucher_entity_1 = require("../../domain/entities/voucher.entity");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
const typeorm_2 = require("typeorm");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
const user_entity_1 = require("../../../../core/iam/entities/user.entity");
const voucher_type_entity_1 = require("../../domain/entities/voucher-type.entity");
const account_entity_1 = require("../../domain/entities/account.entity");
const detailed_account_entity_1 = require("../../domain/entities/detailed-account.entity");
const accounts_related_detailed_account_entity_1 = require("../../domain/entities/accounts-related-detailed-account.entity");
const fiscal_year_entity_1 = require("../../../common/domain/entities/fiscal-year.entity");
let VoucherService = class VoucherService {
    constructor(voucherRepository, voucherItemRepository, requestContextService, idGenerationService) {
        this.voucherRepository = voucherRepository;
        this.voucherItemRepository = voucherItemRepository;
        this.requestContextService = requestContextService;
        this.idGenerationService = idGenerationService;
    }
    async calculateNextNumberInternal(manager, entityRef, jalaliDateStr, companyId, businessStructureId) {
        let year = '1403';
        if (jalaliDateStr) {
            const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
            const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
            const englishDateStr = jalaliDateStr
                .replace(/[۰-۹]/g, w => persianDigits.indexOf(w).toString())
                .replace(/[٠-٩]/g, w => arabicDigits.indexOf(w).toString());
            const match = englishDateStr.match(/^(\d{4})/);
            if (match) {
                year = match[1];
            }
        }
        let config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
            where: {
                entityRef,
                companyRef: companyId,
            }
        });
        if (!config) {
            config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                where: {
                    entityRef,
                    businessStructureRef: businessStructureId,
                }
            });
        }
        let numberingMethod = '2';
        let numberingType = '1';
        let baseNumbering = ['fiscalYear'];
        let items = null;
        if (config) {
            numberingMethod = config.numberingMethod || '2';
            numberingType = config.numberingType || '1';
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
        let query = manager.getRepository(voucher_entity_1.Voucher)
            .createQueryBuilder('v')
            .where('v.companyRef = :companyId', { companyId })
            .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId });
        if (hasFiscalYearCheck) {
            const startJ = `${year}/01/01`;
            const endJ = `${parseInt(year, 10) + 1}/01/01`;
            const startDate = (0, moment_jalaali_1.default)(startJ, 'jYYYY/jMM/jDD').toDate();
            const endDate = (0, moment_jalaali_1.default)(endJ, 'jYYYY/jMM/jDD').toDate();
            query = query.andWhere('v.voucherDate >= :startDate AND v.voucherDate < :endDate', { startDate, endDate });
        }
        if (entityRef === 'accounting_doc') {
            const lastVoucher = await query
                .orderBy('v.voucherNumber', 'DESC')
                .getOne();
            let nextSeq = startNumber;
            if (lastVoucher) {
                let prefixStr = String(fixedChar || '');
                let lastValStr = String(lastVoucher.voucherNumber || '');
                if (prefixStr && lastValStr.startsWith(prefixStr)) {
                    const numPart = lastValStr.slice(prefixStr.length);
                    const parsed = parseInt(numPart, 10);
                    if (!isNaN(parsed)) {
                        nextSeq = parsed + 1;
                    }
                    else {
                        nextSeq = lastVoucher.voucherNumber + 1;
                    }
                }
                else {
                    nextSeq = (lastVoucher.voucherNumber || 0) + 1;
                }
            }
            if (nextSeq > endNumber) {
                return {
                    numberingMethod,
                    nextValue: '',
                    error: `شماره سند حسابداری تولید شده (${nextSeq}) از شماره پایانی تعریف شده (${endNumber}) در روش شماره گذاری برای سال مالی ${year} تجاوز کرده است.`
                };
            }
            const formatted = String(fixedChar || '') + String(nextSeq);
            return { numberingMethod, nextValue: formatted };
        }
        else {
            const lastVoucher = await query
                .andWhere('v.referenceNumber IS NOT NULL AND v.referenceNumber != :empty', { empty: '' })
                .orderBy('LENGTH(v.referenceNumber)', 'DESC')
                .addOrderBy('v.referenceNumber', 'DESC')
                .getOne();
            let nextSeq = startNumber;
            if (lastVoucher && lastVoucher.referenceNumber) {
                const lastRef = lastVoucher.referenceNumber;
                let prefixStr = String(fixedChar || '');
                if (prefixStr && lastRef.startsWith(prefixStr)) {
                    const numPart = lastRef.slice(prefixStr.length);
                    const parsed = parseInt(numPart, 10);
                    if (!isNaN(parsed)) {
                        nextSeq = parsed + 1;
                    }
                    else {
                        nextSeq = startNumber;
                    }
                }
                else {
                    const matchDigits = lastRef.match(/\d+$/);
                    if (matchDigits) {
                        nextSeq = parseInt(matchDigits[0], 10) + 1;
                    }
                    else {
                        nextSeq = startNumber;
                    }
                }
            }
            if (nextSeq > endNumber) {
                return {
                    numberingMethod,
                    nextValue: '',
                    error: `شماره عطف تولید شده (${nextSeq}) از شماره پایانی تعریف شده (${endNumber}) برای سال مالی ${year} تجاوز کرده است.`
                };
            }
            const formatted = String(fixedChar || '') + String(nextSeq);
            return { numberingMethod, nextValue: formatted };
        }
    }
    async getNextNumbers(jalaliDateStr) {
        const companyId = this.requestContextService.getCompanyId() || 2;
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        const manager = this.voucherItemRepository.manager;
        const docResult = await this.calculateNextNumberInternal(manager, 'accounting_doc', jalaliDateStr, companyId, businessStructureId);
        const refResult = await this.calculateNextNumberInternal(manager, 'accounting_ref', jalaliDateStr, companyId, businessStructureId);
        return {
            voucherNumber: docResult.nextValue,
            isVoucherNumberAuto: docResult.numberingMethod === '2',
            referenceNumber: refResult.nextValue,
            isReferenceNumberAuto: refResult.numberingMethod === '2',
            error: docResult.error || refResult.error || null,
        };
    }
    async create(createVoucherDto) {
        const userId = this.requestContextService.getUserId() || 1;
        const companyId = this.requestContextService.getCompanyId() || 2;
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        return await this.voucherItemRepository.manager.transaction(async (manager) => {
            const lockKey = 1000000 + (companyId > 1 ? companyId : 2);
            await manager.query('SELECT pg_advisory_xact_lock($1)', [lockKey]);
            const dateStr = createVoucherDto.voucherDate ? (0, moment_jalaali_1.default)(createVoucherDto.voucherDate).format('jYYYY/jMM/jDD') : '';
            const docRes = await this.calculateNextNumberInternal(manager, 'accounting_doc', dateStr, companyId, businessStructureId);
            const refRes = await this.calculateNextNumberInternal(manager, 'accounting_ref', dateStr, companyId, businessStructureId);
            if (docRes.error) {
                throw new Error(docRes.error);
            }
            if (refRes.error) {
                throw new Error(refRes.error);
            }
            let finalVoucherNumber = Number(createVoucherDto.voucherNumber);
            if (docRes.numberingMethod === '2' || !finalVoucherNumber) {
                finalVoucherNumber = Number(docRes.nextValue) || 1;
            }
            let finalReferenceNumber = createVoucherDto.referenceNumber;
            if (refRes.numberingMethod === '2' || !finalReferenceNumber) {
                finalReferenceNumber = refRes.nextValue || '1';
            }
            let totalDebit = 0;
            let totalCredit = 0;
            if (createVoucherDto.items) {
                createVoucherDto.items.forEach(item => {
                    totalDebit += Number(item.debit) || 0;
                    totalCredit += Number(item.credit) || 0;
                });
            }
            const { items, ...rest } = createVoucherDto;
            const justDate = createVoucherDto.voucherDate ? new Date(createVoucherDto.voucherDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            const lastDailyVoucher = await manager.getRepository(voucher_entity_1.Voucher)
                .createQueryBuilder('v')
                .where('v.companyRef = :companyId', { companyId })
                .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId })
                .andWhere('v.voucherDate = :justDate', { justDate })
                .orderBy('v.dailyNumber', 'DESC')
                .getOne();
            const nextDailyNumber = (lastDailyVoucher?.dailyNumber || 0) + 1;
            const nextId = await this.idGenerationService.generateNextId('Voucher');
            const fiscalYearId = this.requestContextService.getFiscalYearId();
            const createdVoucher = manager.create(voucher_entity_1.Voucher, {
                ...rest,
                voucherId: nextId,
                voucherNumber: finalVoucherNumber,
                referenceNumber: finalReferenceNumber,
                dailyNumber: nextDailyNumber,
                creator: userId,
                lastModifier: userId,
                totalDebit,
                totalCredit,
                businessStructureRef: businessStructureId,
                companyRef: companyId,
                fiscalYearRef: fiscalYearId,
            });
            const savedVoucher = await manager.save(createdVoucher);
            if (items && items.length > 0) {
                const startItemId = await this.idGenerationService.generateNextIdBlock('VoucherItem', items.length);
                const itemsToSave = items.map((item, idx) => manager.create(voucher_item_entity_1.VoucherItem, {
                    ...item,
                    voucherItemId: startItemId + idx,
                    voucherId: savedVoucher.voucherId,
                    creator: userId,
                    lastModifier: userId,
                    businessStructureRef: businessStructureId,
                    companyRef: companyId,
                }));
                await manager.save(voucher_item_entity_1.VoucherItem, itemsToSave);
            }
            return this.findOneInternal(savedVoucher.voucherId, manager);
        });
    }
    async findOneInternal(id, manager) {
        const voucher = await manager.findOne(voucher_entity_1.Voucher, { where: { voucherId: id }, relations: ['items'] });
        if (!voucher)
            return null;
        if (voucher.creator) {
            try {
                const creatorUser = await manager.findOne(user_entity_1.User, { where: { id: voucher.creator } });
                if (creatorUser) {
                    voucher['creatorName'] = `${creatorUser.firstName || ''} ${creatorUser.lastName || ''}`.trim() || creatorUser.username;
                }
            }
            catch (e) {
                console.error('Failed to manually fetch user info', e);
            }
        }
        if (voucher.voucherTypeId) {
            try {
                const vt = await manager.findOne(voucher_type_entity_1.VoucherType, { where: { voucherTypeId: voucher.voucherTypeId } });
                if (vt) {
                    voucher['voucherType'] = vt;
                }
            }
            catch (e) {
                console.error('Failed to load voucher type', e);
            }
        }
        if (voucher.items && voucher.items.length > 0) {
            for (const item of voucher.items) {
                if (item.accountId) {
                    try {
                        const acc = await manager.findOne(account_entity_1.Account, {
                            where: { id: item.accountId },
                            relations: ['parent', 'parent.parent']
                        });
                        if (acc) {
                            item['account'] = acc;
                            const rels = await manager.find(accounts_related_detailed_account_entity_1.AccountsRelatedDetailedAccount, {
                                where: { accountId: item.accountId },
                                relations: ['detailedType']
                            });
                            item['account'].relatedDetailedAccounts = rels.map((r) => ({
                                detailedLevel: r.detailedLevel,
                                detailedType: r.detailedType ? { title: r.detailedType.title } : null
                            }));
                        }
                    }
                    catch (e) {
                        console.error('Failed to load related detailed accounts', e);
                    }
                }
                const loadDetail = async (idVal) => {
                    if (!idVal)
                        return null;
                    try {
                        const da = await manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: idVal } });
                        return da ? { id: da.detailedAccountId, title: da.title, code: da.code, title_en: da.title_en } : null;
                    }
                    catch (e) {
                        return null;
                    }
                };
                if (item.detailedAccountId1)
                    item['detailedAccount1'] = await loadDetail(item.detailedAccountId1);
                if (item.detailedAccountId2)
                    item['detailedAccount2'] = await loadDetail(item.detailedAccountId2);
                if (item.detailedAccountId3)
                    item['detailedAccount3'] = await loadDetail(item.detailedAccountId3);
                if (item.detailedAccountId4)
                    item['detailedAccount4'] = await loadDetail(item.detailedAccountId4);
                if (item.detailedAccountId5)
                    item['detailedAccount5'] = await loadDetail(item.detailedAccountId5);
                if (item.detailedAccountId6)
                    item['detailedAccount6'] = await loadDetail(item.detailedAccountId6);
                if (item.detailedAccountId7)
                    item['detailedAccount7'] = await loadDetail(item.detailedAccountId7);
                if (item.detailedAccountId8)
                    item['detailedAccount8'] = await loadDetail(item.detailedAccountId8);
                if (item.detailedAccountId9)
                    item['detailedAccount9'] = await loadDetail(item.detailedAccountId9);
                if (item.detailedAccountId10)
                    item['detailedAccount10'] = await loadDetail(item.detailedAccountId10);
            }
        }
        return voucher;
    }
    async getLastVoucherDate(fiscalYearId) {
        const companyId = this.requestContextService.getCompanyId() || 2;
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        let query = this.voucherItemRepository.manager.getRepository(voucher_entity_1.Voucher)
            .createQueryBuilder('v')
            .where('v.companyRef = :companyId', { companyId })
            .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId });
        if (fiscalYearId) {
            const fyRepo = this.voucherItemRepository.manager.getRepository(fiscal_year_entity_1.FiscalYear);
            const fy = await fyRepo.findOne({ where: { fiscalYearID: parseInt(fiscalYearId, 10) } });
            if (fy) {
                const start = fy.startDate;
                const end = fy.endDate;
                query = query.andWhere('v.voucherDate >= :start AND v.voucherDate <= :end', { start, end });
            }
        }
        const lastVoucher = await query
            .orderBy('v.voucherDate', 'DESC')
            .addOrderBy('v.voucherId', 'DESC')
            .getOne();
        if (lastVoucher && lastVoucher.voucherDate) {
            return { lastDate: (0, moment_jalaali_1.default)(lastVoucher.voucherDate).format('jYYYY/jMM/jDD') };
        }
        if (fiscalYearId) {
            const fyRepo = this.voucherItemRepository.manager.getRepository(fiscal_year_entity_1.FiscalYear);
            const fy = await fyRepo.findOne({ where: { fiscalYearID: parseInt(fiscalYearId, 10) } });
            if (fy && fy.endDate) {
                return { lastDate: (0, moment_jalaali_1.default)(fy.endDate).format('jYYYY/jMM/jDD') };
            }
        }
        return { lastDate: (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD') };
    }
    async getNumberRangeByDate(fromDate, toDate, fiscalYearId) {
        const rawComp = this.requestContextService.getCompanyId();
        const rawBs = this.requestContextService.getBusinessStructureId();
        const companyId = (rawComp && rawComp > 1) ? rawComp : 2;
        const businessStructureId = (rawBs && rawBs > 1) ? rawBs : 2;
        const toEnglishDigits = (str) => {
            if (!str)
                return str;
            return str.replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728)).replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
        };
        const englishFromDate = toEnglishDigits(fromDate);
        const englishToDate = toEnglishDigits(toDate);
        const startDateStr = englishFromDate ? (0, moment_jalaali_1.default)(englishFromDate, 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD') : null;
        const endDateStr = englishToDate ? (0, moment_jalaali_1.default)(englishToDate, 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD') : null;
        const repo = this.voucherItemRepository.manager.getRepository(voucher_entity_1.Voucher);
        const baseQuery = repo.createQueryBuilder('v')
            .where('v.companyRef = :companyId', { companyId })
            .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId });
        if (startDateStr) {
            baseQuery.andWhere('v.voucherDate >= :startDate', { startDate: startDateStr });
        }
        if (endDateStr) {
            baseQuery.andWhere('v.voucherDate <= :endDate', { endDate: endDateStr });
        }
        if (fiscalYearId) {
            const fyId = parseInt(fiscalYearId, 10);
            if (!isNaN(fyId)) {
                baseQuery.andWhere('(v.fiscalYearRef = :fyId OR v.fiscalYearRef IS NULL)', { fyId });
            }
        }
        baseQuery.andWhere('v.status NOT IN (:...excludedStatuses)', { excludedStatuses: [5, 6, 9] });
        const result = await baseQuery
            .select('MIN(v.voucherNumber)', 'min')
            .addSelect('MAX(v.voucherNumber)', 'max')
            .getRawOne();
        return {
            fromVoucherNumber: result?.min ? parseInt(result.min, 10) : null,
            toVoucherNumber: result?.max ? parseInt(result.max, 10) : null,
        };
    }
    async getFinalizeInitialValues(fiscalYearId) {
        const rawComp = this.requestContextService.getCompanyId();
        const rawBs = this.requestContextService.getBusinessStructureId();
        const companyId = (rawComp && rawComp > 1) ? rawComp : 2;
        const businessStructureId = (rawBs && rawBs > 1) ? rawBs : 2;
        let start, end;
        if (fiscalYearId) {
            const fyRepo = this.voucherItemRepository.manager.getRepository(fiscal_year_entity_1.FiscalYear);
            const fy = await fyRepo.findOne({ where: { fiscalYearID: parseInt(fiscalYearId, 10) } });
            if (fy) {
                start = fy.startDate;
                end = fy.endDate;
            }
        }
        const baseQuery = this.voucherItemRepository.manager.getRepository(voucher_entity_1.Voucher)
            .createQueryBuilder('v')
            .where('v.companyRef = :companyId', { companyId })
            .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId });
        if (fiscalYearId) {
            const fyId = parseInt(fiscalYearId, 10);
            if (!isNaN(fyId)) {
                baseQuery.andWhere('(v.fiscalYearRef = :fyId OR v.fiscalYearRef IS NULL)', { fyId });
            }
        }
        if (start && end) {
            baseQuery.andWhere('v.voucherDate >= :start AND v.voucherDate <= :end', { start, end });
        }
        const initialQuery = baseQuery.clone()
            .andWhere('v.status NOT IN (:...excludedStatuses)', { excludedStatuses: [5, 6, 9] });
        const minMaxResult = await initialQuery.clone()
            .select('MIN(v.voucherNumber)', 'min')
            .addSelect('MAX(v.voucherNumber)', 'max')
            .getRawOne();
        const firstInitial = await initialQuery.clone()
            .orderBy('v.voucherDate', 'ASC')
            .addOrderBy('v.voucherNumber', 'ASC')
            .getOne();
        const lastRecord = await initialQuery.clone()
            .orderBy('v.voucherDate', 'DESC')
            .addOrderBy('v.voucherNumber', 'DESC')
            .getOne();
        return {
            fromDate: firstInitial?.voucherDate ? (0, moment_jalaali_1.default)(firstInitial.voucherDate).format('jYYYY/jMM/jDD') : (start ? (0, moment_jalaali_1.default)(start).format('jYYYY/jMM/jDD') : ''),
            toDate: lastRecord?.voucherDate ? (0, moment_jalaali_1.default)(lastRecord.voucherDate).format('jYYYY/jMM/jDD') : (end ? (0, moment_jalaali_1.default)(end).format('jYYYY/jMM/jDD') : ''),
            fromVoucherNumber: minMaxResult?.min ? parseInt(minMaxResult.min, 10) : 1,
            toVoucherNumber: minMaxResult?.max ? parseInt(minMaxResult.max, 10) : 1,
        };
    }
    async finalizeVouchers(body) {
        const { fromDate, toDate, fromVoucherNumber, toVoucherNumber, fiscalYearId } = body;
        const companyId = this.requestContextService.getCompanyId() || 2;
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        const toEnglishDigits = (str) => {
            if (!str)
                return str;
            return str.replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728)).replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
        };
        const englishFromDate = toEnglishDigits(fromDate);
        const englishToDate = toEnglishDigits(toDate);
        const num1 = Number(toEnglishDigits(String(fromVoucherNumber)));
        const num2 = Number(toEnglishDigits(String(toVoucherNumber)));
        const startDate = englishFromDate ? (0, moment_jalaali_1.default)(englishFromDate, 'jYYYY/jMM/jDD').toDate() : null;
        const endDate = englishToDate ? (0, moment_jalaali_1.default)(englishToDate, 'jYYYY/jMM/jDD').toDate() : null;
        let fyStart, fyEnd;
        if (fiscalYearId) {
            const fyRepo = this.voucherItemRepository.manager.getRepository(fiscal_year_entity_1.FiscalYear);
            const fy = await fyRepo.findOne({ where: { fiscalYearID: parseInt(fiscalYearId, 10) } });
            if (fy) {
                fyStart = fy.startDate;
                fyEnd = fy.endDate;
            }
        }
        return await this.voucherItemRepository.manager.transaction(async (manager) => {
            const minNum = Math.min(num1, num2);
            const maxNum = Math.max(num1, num2);
            const rangeVouchers = await manager.getRepository(voucher_entity_1.Voucher)
                .createQueryBuilder('v')
                .where('v.companyRef = :companyId', { companyId })
                .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId })
                .andWhere('v.voucherNumber >= :minNum AND v.voucherNumber <= :maxNum', { minNum, maxNum })
                .getMany();
            const existingNumbers = rangeVouchers.map(v => v.voucherNumber);
            let hasGap = false;
            for (let num = minNum; num <= maxNum; num++) {
                if (!existingNumbers.includes(num)) {
                    hasGap = true;
                    break;
                }
            }
            if (hasGap) {
                return {
                    success: false,
                    error: 'در بازه تعیین شده، نیاز به شماره گذاری مجدد اسناد حسابداری می باشد'
                };
            }
            const firstNonFinalizedQuery = manager.getRepository(voucher_entity_1.Voucher)
                .createQueryBuilder('v')
                .where('v.companyRef = :companyId', { companyId })
                .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId });
            if (fyStart && fyEnd) {
                firstNonFinalizedQuery.andWhere('v.voucherDate >= :fyStart AND v.voucherDate <= :fyEnd', { fyStart, fyEnd });
            }
            const firstNonFinalized = await firstNonFinalizedQuery
                .andWhere('v.status NOT IN (:...excludedStatuses)', { excludedStatuses: [5, 6, 9] })
                .orderBy('v.voucherDate', 'ASC')
                .addOrderBy('v.voucherNumber', 'ASC')
                .getOne();
            if (firstNonFinalized) {
                const firstNFDateStr = toEnglishDigits((0, moment_jalaali_1.default)(firstNonFinalized.voucherDate).locale('en').format('jYYYY/jMM/jDD'));
                if (englishFromDate !== firstNFDateStr || minNum !== firstNonFinalized.voucherNumber) {
                    return {
                        success: false,
                        error: `عملیات دائمی‌سازی باید حتماً از اولین سند غیر دائم (سند شماره ${firstNonFinalized.voucherNumber} به تاریخ ${(0, moment_jalaali_1.default)(firstNonFinalized.voucherDate).format('jYYYY/jMM/jDD')}) شروع شود و ترتیب رعایت گردد.`
                    };
                }
            }
            const query = manager.getRepository(voucher_entity_1.Voucher)
                .createQueryBuilder('v')
                .where('v.companyRef = :companyId', { companyId })
                .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId });
            if (startDate && endDate) {
                query.andWhere('v.voucherDate >= :startDate AND v.voucherDate <= :endDate', { startDate, endDate });
            }
            else if (fyStart && fyEnd) {
                query.andWhere('v.voucherDate >= :startDate AND v.voucherDate <= :endDate', { startDate: fyStart, endDate: fyEnd });
            }
            if (fromVoucherNumber && toVoucherNumber) {
                query.andWhere('v.voucherNumber >= :minNum AND v.voucherNumber <= :maxNum', { minNum, maxNum });
            }
            const noteVouchers = await query.clone()
                .andWhere('v.status = 1')
                .orderBy('v.voucherNumber', 'ASC')
                .getMany();
            if (noteVouchers.length > 0) {
                const errorLines = noteVouchers.map(v => {
                    const jDate = v.voucherDate ? (0, moment_jalaali_1.default)(v.voucherDate).format('jYYYY/jMM/jDD') : '';
                    return `سند شماره ${v.voucherNumber} به تاریخ ${jDate} در وضعیت یادداشت می باشد.`;
                });
                return {
                    success: false,
                    error: errorLines.join('\n'),
                    noteVoucherId: noteVouchers[0].voucherId,
                    noteVouchers: noteVouchers.map(v => ({
                        voucherId: v.voucherId,
                        voucherNumber: v.voucherNumber,
                        voucherDate: v.voucherDate ? (0, moment_jalaali_1.default)(v.voucherDate).format('jYYYY/jMM/jDD') : ''
                    }))
                };
            }
            const updateQuery = manager.getRepository(voucher_entity_1.Voucher)
                .createQueryBuilder()
                .update(voucher_entity_1.Voucher)
                .set({
                status: 9,
                previousStatus: () => '"Status"'
            })
                .where('companyRef = :companyId', { companyId })
                .andWhere('businessStructureRef = :businessStructureId', { businessStructureId });
            if (startDate && endDate) {
                updateQuery.andWhere('voucherDate >= :startDate AND voucherDate <= :endDate', { startDate, endDate });
            }
            else if (fyStart && fyEnd) {
                updateQuery.andWhere('voucherDate >= :startDate AND voucherDate <= :endDate', { startDate: fyStart, endDate: fyEnd });
            }
            if (fromVoucherNumber && toVoucherNumber) {
                updateQuery.andWhere('voucherNumber >= :minNum AND voucherNumber <= :maxNum', { minNum, maxNum });
            }
            await updateQuery
                .andWhere('status IN (:...statuses)', { statuses: [2, 3, 4] })
                .execute();
            return {
                success: true,
                message: 'اسناد با موفقیت دائم شدند.'
            };
        });
    }
    async getReverseFinalizeInitialValues(fiscalYearId) {
        const rawComp = this.requestContextService.getCompanyId();
        const rawBs = this.requestContextService.getBusinessStructureId();
        const companyId = (rawComp && rawComp > 1) ? rawComp : 2;
        const businessStructureId = (rawBs && rawBs > 1) ? rawBs : 2;
        let start, end;
        if (fiscalYearId) {
            const fyRepo = this.voucherItemRepository.manager.getRepository(fiscal_year_entity_1.FiscalYear);
            const fy = await fyRepo.findOne({ where: { fiscalYearID: parseInt(fiscalYearId, 10) } });
            if (fy) {
                start = fy.startDate;
                end = fy.endDate;
            }
        }
        const baseQuery = this.voucherItemRepository.manager.getRepository(voucher_entity_1.Voucher)
            .createQueryBuilder('v')
            .where('v.companyRef = :companyId', { companyId })
            .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId })
            .andWhere('v.status = 9');
        if (fiscalYearId) {
            const fyId = parseInt(fiscalYearId, 10);
            if (!isNaN(fyId)) {
                baseQuery.andWhere('(v.fiscalYearRef = :fyId OR v.fiscalYearRef IS NULL)', { fyId });
            }
        }
        if (start && end) {
            baseQuery.andWhere('v.voucherDate >= :start AND v.voucherDate <= :end', { start, end });
        }
        const minMaxResult = await baseQuery.clone()
            .select('MIN(v.voucherNumber)', 'min')
            .addSelect('MAX(v.voucherNumber)', 'max')
            .getRawOne();
        const earliestRecord = await baseQuery.clone()
            .orderBy('v.voucherDate', 'ASC')
            .addOrderBy('v.voucherNumber', 'ASC')
            .getOne();
        const latestRecord = await baseQuery.clone()
            .orderBy('v.voucherDate', 'DESC')
            .addOrderBy('v.voucherNumber', 'DESC')
            .getOne();
        if (!latestRecord) {
            return {
                fromDate: '',
                toDate: '',
                fromVoucherNumber: null,
                toVoucherNumber: null,
            };
        }
        return {
            fromDate: latestRecord.voucherDate ? (0, moment_jalaali_1.default)(latestRecord.voucherDate).format('jYYYY/jMM/jDD') : '',
            toDate: earliestRecord?.voucherDate ? (0, moment_jalaali_1.default)(earliestRecord.voucherDate).format('jYYYY/jMM/jDD') : '',
            fromVoucherNumber: minMaxResult?.max ? parseInt(minMaxResult.max, 10) : (latestRecord.voucherNumber || null),
            toVoucherNumber: minMaxResult?.min ? parseInt(minMaxResult.min, 10) : (earliestRecord?.voucherNumber || null),
        };
    }
    async reverseFinalizeVouchers(body) {
        const { fromDate, toDate, fromVoucherNumber, toVoucherNumber, fiscalYearId } = body;
        const companyId = this.requestContextService.getCompanyId() || 2;
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        const toEnglishDigits = (str) => str.replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728)).replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
        const num1 = Number(toEnglishDigits(String(fromVoucherNumber)));
        const num2 = Number(toEnglishDigits(String(toVoucherNumber)));
        const lowerBoundNum = Math.min(num1, num2);
        const upperBoundNum = Math.max(num1, num2);
        const mDate1 = (0, moment_jalaali_1.default)(toEnglishDigits(fromDate), 'jYYYY/jMM/jDD');
        const mDate2 = (0, moment_jalaali_1.default)(toEnglishDigits(toDate), 'jYYYY/jMM/jDD');
        if (!mDate1.isValid() || !mDate2.isValid()) {
            return { success: false, error: 'تاریخ‌های وارد شده معتبر نمی‌باشند.' };
        }
        const startDateStr = mDate1.isBefore(mDate2) ? mDate1.locale('en').format('YYYY-MM-DD') : mDate2.locale('en').format('YYYY-MM-DD');
        const endDateStr = mDate1.isBefore(mDate2) ? mDate2.locale('en').format('YYYY-MM-DD') : mDate1.locale('en').format('YYYY-MM-DD');
        let fyStart, fyEnd;
        if (fiscalYearId) {
            const fyRepo = this.voucherItemRepository.manager.getRepository(fiscal_year_entity_1.FiscalYear);
            const fy = await fyRepo.findOne({ where: { fiscalYearID: parseInt(fiscalYearId, 10) } });
            if (fy) {
                fyStart = fy.startDate;
                fyEnd = fy.endDate;
            }
        }
        return await this.voucherItemRepository.manager.transaction(async (manager) => {
            const restrictedTypes = await manager.getRepository(voucher_type_entity_1.VoucherType)
                .createQueryBuilder('vt')
                .where('vt.title IN (:...titles)', { titles: ['سود و زیانی', 'سند اختتامیه'] })
                .getMany();
            if (restrictedTypes.length > 0) {
                const restrictedTypeIds = restrictedTypes.map(t => t.voucherTypeId);
                const restrictedVoucherQuery = manager.getRepository(voucher_entity_1.Voucher)
                    .createQueryBuilder('v')
                    .where('v.companyRef = :companyId', { companyId })
                    .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId })
                    .andWhere('v.voucherTypeId IN (:...restrictedTypeIds)', { restrictedTypeIds })
                    .andWhere('v.voucherDate >= :startDate AND v.voucherDate <= :endDate', { startDate: startDateStr, endDate: endDateStr })
                    .andWhere('v.voucherNumber >= :lowerBoundNum AND v.voucherNumber <= :upperBoundNum', { lowerBoundNum, upperBoundNum });
                const hasRestrictedVoucher = await restrictedVoucherQuery.getOne();
                if (hasRestrictedVoucher) {
                    return {
                        success: false,
                        error: 'امکان برگشت از دائم وجود ندارد زیرا سند سود و زیانی یا سند اختتامیه در بازه تعیین شده وجود دارد.'
                    };
                }
            }
            const latestFinalizedQuery = manager.getRepository(voucher_entity_1.Voucher)
                .createQueryBuilder('v')
                .where('v.companyRef = :companyId', { companyId })
                .andWhere('v.businessStructureRef = :businessStructureId', { businessStructureId })
                .andWhere('v.status = 9');
            if (fyStart && fyEnd) {
                latestFinalizedQuery.andWhere('v.voucherDate >= :fyStart AND v.voucherDate <= :fyEnd', { fyStart, fyEnd });
            }
            const latestFinalized = await latestFinalizedQuery
                .orderBy('v.voucherDate', 'DESC')
                .addOrderBy('v.voucherNumber', 'DESC')
                .getOne();
            if (!latestFinalized) {
                return {
                    success: false,
                    error: 'هیچ سند دائمی در سال مالی فعال وجود ندارد.'
                };
            }
            const systemLatestNum = Number(latestFinalized.voucherNumber);
            const systemLatestDateStr = toEnglishDigits((0, moment_jalaali_1.default)(latestFinalized.voucherDate).locale('en').format('jYYYY/jMM/jDD'));
            const userLatestNum = upperBoundNum;
            const userLatestDateStr = toEnglishDigits((0, moment_jalaali_1.default)(endDateStr, 'YYYY-MM-DD').locale('en').format('jYYYY/jMM/jDD'));
            if (userLatestNum !== systemLatestNum || userLatestDateStr !== systemLatestDateStr) {
                return {
                    success: false,
                    error: `عملیات برگشت از دائم باید حتماً از آخرین سند دائم (سند شماره ${systemLatestNum} به تاریخ ${(0, moment_jalaali_1.default)(latestFinalized.voucherDate).format('jYYYY/jMM/jDD')}) شروع شود.`
                };
            }
            const result = await manager.getRepository(voucher_entity_1.Voucher)
                .createQueryBuilder()
                .update(voucher_entity_1.Voucher)
                .set({
                status: () => 'COALESCE("PreviousStatus", 2)',
                previousStatus: null
            })
                .where('companyRef = :companyId', { companyId })
                .andWhere('businessStructureRef = :businessStructureId', { businessStructureId })
                .andWhere('status = 9')
                .andWhere('voucherDate >= :startDate AND voucherDate <= :endDate', { startDate: startDateStr, endDate: endDateStr })
                .andWhere('voucherNumber >= :lowerBoundNum AND voucherNumber <= :upperBoundNum', { lowerBoundNum, upperBoundNum })
                .execute();
            return {
                success: true,
                affected: result.affected
            };
        });
    }
    async findAll() {
        const companyId = this.requestContextService.getCompanyId() || 2;
        return this.voucherRepository.findAll(companyId);
    }
    async findOne(id) {
        return this.voucherRepository.findById(id);
    }
    async update(id, updateVoucherDto) {
        const userId = this.requestContextService.getUserId() || 1;
        const companyId = this.requestContextService.getCompanyId() || 2;
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        return await this.voucherItemRepository.manager.transaction(async (manager) => {
            const lockKey = 1000000 + (companyId > 1 ? companyId : 2);
            await manager.query('SELECT pg_advisory_xact_lock($1)', [lockKey]);
            const voucher = await manager.findOne(voucher_entity_1.Voucher, { where: { voucherId: id } });
            if (!voucher)
                throw new Error('Voucher not found');
            const dateStr = updateVoucherDto.voucherDate ? (0, moment_jalaali_1.default)(updateVoucherDto.voucherDate).format('jYYYY/jMM/jDD') : (0, moment_jalaali_1.default)(voucher.voucherDate).format('jYYYY/jMM/jDD');
            const docRes = await this.calculateNextNumberInternal(manager, 'accounting_doc', dateStr, companyId, businessStructureId);
            const refRes = await this.calculateNextNumberInternal(manager, 'accounting_ref', dateStr, companyId, businessStructureId);
            const { items, ...rest } = updateVoucherDto;
            if (!voucher.fiscalYearRef) {
                rest['fiscalYearRef'] = this.requestContextService.getFiscalYearId();
            }
            if (docRes.numberingMethod === '2') {
                rest['voucherNumber'] = voucher.voucherNumber;
            }
            if (refRes.numberingMethod === '2') {
                rest['referenceNumber'] = voucher.referenceNumber;
            }
            if (items) {
                let totalDebit = 0;
                let totalCredit = 0;
                items.forEach(item => {
                    if (!item.isDeleted) {
                        totalDebit += Number(item.debit) || 0;
                        totalCredit += Number(item.credit) || 0;
                    }
                });
                rest['totalDebit'] = totalDebit;
                rest['totalCredit'] = totalCredit;
                const dbItems = await manager.find(voucher_item_entity_1.VoucherItem, { where: { voucherId: id } });
                const incomingItemIds = items
                    .filter(item => item.voucherItemId && !item.isDeleted)
                    .map(item => Number(item.voucherItemId));
                for (const dbItem of dbItems) {
                    if (!incomingItemIds.includes(dbItem.voucherItemId)) {
                        await manager.delete(voucher_item_entity_1.VoucherItem, { voucherItemId: dbItem.voucherItemId });
                    }
                }
                for (const item of items) {
                    if (item.voucherItemId) {
                        if (item.isDeleted) {
                            await manager.delete(voucher_item_entity_1.VoucherItem, { voucherItemId: item.voucherItemId });
                        }
                        else {
                            const { voucherItemId, ...itemData } = item;
                            await manager.update(voucher_item_entity_1.VoucherItem, { voucherItemId }, {
                                ...itemData,
                                lastModifier: userId
                            });
                        }
                    }
                    else if (!item.isDeleted) {
                        const nextItemId = await this.idGenerationService.generateNextId('VoucherItem');
                        const newItem = manager.create(voucher_item_entity_1.VoucherItem, {
                            ...item,
                            voucherItemId: nextItemId,
                            voucherId: id,
                            creator: userId,
                            lastModifier: userId,
                            businessStructureRef: businessStructureId,
                            companyRef: companyId,
                        });
                        await manager.save(voucher_item_entity_1.VoucherItem, newItem);
                    }
                }
            }
            await manager.update(voucher_entity_1.Voucher, { voucherId: id }, {
                ...rest,
                lastModifier: userId,
            });
            return this.findOneInternal(id, manager);
        });
    }
    async remove(id) {
        await this.voucherItemRepository.delete({ voucherId: id });
        return this.voucherRepository.delete(id);
    }
    async renumber(body) {
        const { fromDate, toDate, renumberVoucher, renumberReference } = body;
        const companyId = this.requestContextService.getCompanyId() || 2;
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        const toEnglishDigits = (str) => {
            if (!str)
                return str;
            return str.replace(/[۰-۹]/g, d => String.fromCharCode(d.charCodeAt(0) - 1728)).replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
        };
        const englishFromDate = toEnglishDigits(fromDate);
        const englishToDate = toEnglishDigits(toDate);
        const startDate = (0, moment_jalaali_1.default)(englishFromDate, 'jYYYY/jMM/jDD').toDate();
        const endDate = (0, moment_jalaali_1.default)(englishToDate, 'jYYYY/jMM/jDD').toDate();
        return await this.voucherItemRepository.manager.transaction(async (manager) => {
            const lockKey = 2000000 + (companyId > 1 ? companyId : 2);
            await manager.query('SELECT pg_advisory_xact_lock($1)', [lockKey]);
            const permanentVoucher = await manager.getRepository(voucher_entity_1.Voucher)
                .createQueryBuilder('v')
                .where('v.companyRef = :companyId', { companyId })
                .andWhere('v.voucherDate >= :startDate AND v.voucherDate <= :endDate', { startDate, endDate })
                .andWhere('v.status IN (:...statuses)', { statuses: [4, 5, 6, 9] })
                .getOne();
            if (permanentVoucher) {
                return {
                    success: false,
                    error: 'در بازه زمانی تعیین شده اسناد دائم یا ابطال شده وجود دارد.شماره گذاری مجدد لغو شد',
                };
            }
            const vouchersToRenumber = await manager.getRepository(voucher_entity_1.Voucher)
                .createQueryBuilder('v')
                .where('v.companyRef = :companyId', { companyId })
                .andWhere('v.voucherDate >= :startDate AND v.voucherDate <= :endDate', { startDate, endDate })
                .andWhere('(v.status NOT IN (:...statuses) OR v.status IS NULL)', { statuses: [4, 5, 6, 9] })
                .orderBy('v.voucherDate', 'ASC')
                .addOrderBy('v.voucherId', 'ASC')
                .getMany();
            if (vouchersToRenumber.length === 0) {
                return {
                    success: true,
                    message: 'هیچ سندی برای شماره گذاری مجدد در این بازه یافت نشد.',
                };
            }
            const year = fromDate.split('/')[0] || '1403';
            let startVoucherNumber = 1;
            let voucherConfig = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                where: {
                    entityRef: 'accounting_doc',
                    companyRef: companyId,
                }
            });
            if (!voucherConfig) {
                voucherConfig = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                    where: {
                        entityRef: 'accounting_doc',
                        businessStructureRef: businessStructureId,
                    }
                });
            }
            if (voucherConfig && voucherConfig.items) {
                let fYears = voucherConfig.items.fiscalYears || [];
                if (Array.isArray(voucherConfig.items)) {
                    fYears = voucherConfig.items;
                }
                const matchYear = fYears.find((fy) => fy.fiscalYearTitle === year);
                if (matchYear) {
                    startVoucherNumber = parseInt(matchYear.startNumber || '1', 10);
                }
            }
            let startReferenceNumber = 1;
            let referencePrefix = '';
            let referenceConfig = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                where: {
                    entityRef: 'accounting_ref',
                    companyRef: companyId,
                }
            });
            if (!referenceConfig) {
                referenceConfig = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                    where: {
                        entityRef: 'accounting_ref',
                        businessStructureRef: businessStructureId,
                    }
                });
            }
            if (referenceConfig && referenceConfig.items) {
                let fYears = referenceConfig.items.fiscalYears || [];
                if (Array.isArray(referenceConfig.items)) {
                    fYears = referenceConfig.items;
                }
                const matchYear = fYears.find((fy) => fy.fiscalYearTitle === year);
                if (matchYear) {
                    startReferenceNumber = parseInt(matchYear.startNumber || '1', 10);
                    referencePrefix = matchYear.fixedChar || '';
                }
            }
            for (let i = 0; i < vouchersToRenumber.length; i++) {
                const voucher = vouchersToRenumber[i];
                const updateFields = {};
                if (renumberVoucher) {
                    updateFields.voucherNumber = startVoucherNumber + i;
                }
                if (renumberReference) {
                    updateFields.referenceNumber = String(referencePrefix || '') + String(startReferenceNumber + i);
                }
                if (Object.keys(updateFields).length > 0) {
                    await manager.update(voucher_entity_1.Voucher, { voucherId: voucher.voucherId }, updateFields);
                }
            }
            return {
                success: true,
                message: 'عملیات شماره گذاری مجدد با موفقیت انجام شد.',
            };
        });
    }
};
exports.VoucherService = VoucherService;
exports.VoucherService = VoucherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IVoucherRepository')),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_item_entity_1.VoucherItem)),
    __metadata("design:paramtypes", [Object, typeorm_2.Repository,
        request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService])
], VoucherService);
//# sourceMappingURL=voucher.service.js.map
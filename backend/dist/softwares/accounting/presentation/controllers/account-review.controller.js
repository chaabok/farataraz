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
exports.AccountReviewController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const voucher_item_entity_1 = require("../../domain/entities/voucher-item.entity");
const voucher_entity_1 = require("../../domain/entities/voucher.entity");
const account_entity_1 = require("../../domain/entities/account.entity");
const detailed_account_entity_1 = require("../../domain/entities/detailed-account.entity");
const detailed_type_entity_1 = require("../../domain/entities/detailed-type.entity");
const currency_entity_1 = require("../../../common/domain/entities/currency.entity");
const business_structure_entity_1 = require("../../../common/domain/entities/business-structure.entity");
const fiscal_year_entity_1 = require("../../../common/domain/entities/fiscal-year.entity");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
let AccountReviewController = class AccountReviewController {
    constructor(voucherItemRepository, accountRepository, detailedAccountRepository, currencyRepository, requestContextService) {
        this.voucherItemRepository = voucherItemRepository;
        this.accountRepository = accountRepository;
        this.detailedAccountRepository = detailedAccountRepository;
        this.currencyRepository = currencyRepository;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        let isShared = true;
        try {
            const rows = await this.accountRepository.manager.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
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
        return { bsId, compId, isShared };
    }
    async getSidebarItems(type) {
        const { bsId, compId, isShared } = await this.getScope();
        const accountWhere = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        accountWhere.isActive = true;
        if (type === 'branch') {
            const bsRepo = this.accountRepository.manager.getRepository(business_structure_entity_1.BusinessStructure);
            const allBranches = await bsRepo.find({
                order: { code: 'ASC' },
            });
            return allBranches.map(x => ({
                id: x.businessStructureId.toString(),
                code: x.code,
                name: x.title,
            }));
        }
        if (type === 'group' || type === 'total' || type === 'specific') {
            const allAccounts = await this.accountRepository.find({
                where: accountWhere,
                order: { code: 'ASC' },
            });
            const levelsMap = new Map();
            const root = allAccounts.find(x => x.code === '0');
            if (root) {
                levelsMap.set(root.id, 0);
                const setLevel = (parentIds, currentLevel) => {
                    const children = allAccounts.filter(x => x.parentId && parentIds.includes(x.parentId));
                    if (children.length > 0) {
                        children.forEach(c => levelsMap.set(c.id, currentLevel));
                        setLevel(children.map(c => c.id), currentLevel + 1);
                    }
                };
                setLevel([root.id], 1);
            }
            let targetLevel = 1;
            if (type === 'total')
                targetLevel = 2;
            else if (type === 'specific')
                targetLevel = 3;
            const filtered = allAccounts.filter(x => levelsMap.get(x.id) === targetLevel);
            return filtered.map(x => ({
                id: x.id.toString(),
                code: x.code,
                name: x.title,
            }));
        }
        if (type && type.startsWith('detailedType_')) {
            const typeId = parseInt(type.split('_')[1], 10);
            const allDetailed = await this.detailedAccountRepository.find({
                where: { ...accountWhere, isActive: true, detailedTypesId: typeId },
                order: { code: 'ASC' },
            });
            return allDetailed.map(x => ({
                id: x.detailedAccountId.toString(),
                code: x.code,
                name: x.title,
            }));
        }
        if (type && type.startsWith('detailed_')) {
            const allDetailed = await this.detailedAccountRepository.find({
                where: { ...accountWhere, isActive: true },
                order: { code: 'ASC' },
            });
            return allDetailed.map(x => ({
                id: x.detailedAccountId.toString(),
                code: x.code,
                name: x.title,
            }));
        }
        if (type === 'currency') {
            const allCurrencies = await this.currencyRepository.find({
                where: { ...accountWhere, isActive: true },
            });
            return allCurrencies.map(x => ({
                id: x.currencyID.toString(),
                code: x.code.toString(),
                name: x.title,
            }));
        }
        if (type === 'tracking') {
            const distinctTracking = await this.voucherItemRepository
                .createQueryBuilder('item')
                .innerJoin('item.voucher', 'v')
                .select('DISTINCT item.trackingNumber', 'trackingNumber')
                .where('v.companyRef = :compId', { compId })
                .andWhere('item.trackingNumber IS NOT NULL')
                .andWhere("item.trackingNumber != ''")
                .getRawMany();
            return distinctTracking.map((x, idx) => ({
                id: x.trackingNumber,
                code: (idx + 1).toString(),
                name: x.trackingNumber,
            }));
        }
        return [];
    }
    async getVoucherBounds(fromYear, toYear, companyRefStr, businessStructureRefStr) {
        let compId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        let bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        if (companyRefStr) {
            const parsedComp = parseInt(companyRefStr, 10);
            if (!isNaN(parsedComp) && parsedComp > 1)
                compId = parsedComp;
        }
        if (businessStructureRefStr) {
            const parsedBs = parseInt(businessStructureRefStr, 10);
            if (!isNaN(parsedBs) && parsedBs > 1)
                bsId = parsedBs;
        }
        const { isShared } = await this.getScope();
        const fyRepo = this.accountRepository.manager.getRepository(fiscal_year_entity_1.FiscalYear);
        const allFys = await fyRepo.find();
        const normalizeDigits = (str) => {
            if (!str)
                return '';
            return str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
                .replace(/[٠-٩]/g, d => '٠١٢٣۴٥٦٧۸٩'.indexOf(d).toString());
        };
        let startFyDate = null;
        let endFyDate = null;
        if (fromYear) {
            const cleanFrom = normalizeDigits(fromYear).trim();
            const fromFy = allFys.find(f => String(f.fiscalYearID) === cleanFrom ||
                String(f.id) === cleanFrom ||
                f.title === fromYear ||
                (f.title && f.title.includes(cleanFrom)));
            if (fromFy && fromFy.startDate) {
                startFyDate = typeof fromFy.startDate === 'string' ? fromFy.startDate : fromFy.startDate.toISOString().split('T')[0];
            }
        }
        if (toYear) {
            const cleanTo = normalizeDigits(toYear).trim();
            const toFy = allFys.find(f => String(f.fiscalYearID) === cleanTo ||
                String(f.id) === cleanTo ||
                f.title === toYear ||
                (f.title && f.title.includes(cleanTo)));
            if (toFy && toFy.endDate) {
                endFyDate = typeof toFy.endDate === 'string' ? toFy.endDate : toFy.endDate.toISOString().split('T')[0];
            }
        }
        const voucherRepo = this.accountRepository.manager.getRepository(voucher_entity_1.Voucher);
        const qb = voucherRepo.createQueryBuilder('v');
        if (isShared) {
            qb.where('(v.businessStructureRef = :bsId OR v.companyRef = :compId)', { bsId, compId });
        }
        else {
            qb.where('v.companyRef = :compId', { compId });
        }
        if (startFyDate) {
            qb.andWhere('v.voucherDate >= :startFyDate', { startFyDate });
        }
        if (endFyDate) {
            qb.andWhere('v.voucherDate <= :endFyDate', { endFyDate });
        }
        qb.orderBy('v.voucherDate', 'ASC');
        const vouchers = await qb.getMany();
        const monthsMap = [
            '', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
            'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
        ];
        const cleanFromYear = fromYear ? normalizeDigits(fromYear).trim() : '';
        const cleanToYear = toYear ? normalizeDigits(toYear).trim() : '';
        let fallbackFromDate = '';
        let fallbackToDate = '';
        let fallbackFromMonth = 'فروردین';
        let fallbackToMonth = 'اسفند';
        if (startFyDate) {
            const mStart = (0, moment_jalaali_1.default)(startFyDate, ['YYYY-MM-DD', 'jYYYY/jMM/jDD', 'YYYY/MM/DD']);
            if (mStart.isValid()) {
                fallbackFromDate = mStart.format('jYYYY/jMM/jDD');
                fallbackFromMonth = monthsMap[mStart.jMonth() + 1] || 'فروردین';
            }
        }
        if (endFyDate) {
            const mEnd = (0, moment_jalaali_1.default)(endFyDate, ['YYYY-MM-DD', 'jYYYY/jMM/jDD', 'YYYY/MM/DD']);
            if (mEnd.isValid()) {
                fallbackToDate = mEnd.format('jYYYY/jMM/jDD');
                fallbackToMonth = monthsMap[mEnd.jMonth() + 1] || 'اسفند';
            }
        }
        if (!fallbackFromDate) {
            const yr = /^\d{4}$/.test(cleanFromYear) ? cleanFromYear : '1405';
            fallbackFromDate = `${yr}/01/01`;
        }
        if (!fallbackToDate) {
            const yr = /^\d{4}$/.test(cleanToYear) ? cleanToYear : (/^\d{4}$/.test(cleanFromYear) ? cleanFromYear : '1405');
            fallbackToDate = `${yr}/12/29`;
        }
        if (!vouchers || vouchers.length === 0) {
            return {
                success: true,
                hasVouchers: false,
                fromMonth: fallbackFromMonth,
                toMonth: fallbackToMonth,
                fromDate: fallbackFromDate,
                toDate: fallbackToDate,
                fromVoucher: '1',
                toVoucher: '1',
            };
        }
        vouchers.sort((a, b) => {
            const timeA = new Date(a.voucherDate).getTime();
            const timeB = new Date(b.voucherDate).getTime();
            return timeA - timeB;
        });
        const firstVoucher = vouchers[0];
        const lastVoucher = vouchers[vouchers.length - 1];
        let minVoucherNum = vouchers[0].voucherNumber;
        let maxVoucherNum = vouchers[0].voucherNumber;
        vouchers.forEach(v => {
            if (v.voucherNumber !== undefined && v.voucherNumber !== null) {
                if (v.voucherNumber < minVoucherNum)
                    minVoucherNum = v.voucherNumber;
                if (v.voucherNumber > maxVoucherNum)
                    maxVoucherNum = v.voucherNumber;
            }
        });
        const mFirst = (0, moment_jalaali_1.default)(firstVoucher.voucherDate);
        const mLast = (0, moment_jalaali_1.default)(lastVoucher.voucherDate);
        const fromJalaliDate = mFirst.isValid() ? mFirst.format('jYYYY/jMM/jDD') : fallbackFromDate;
        const toJalaliDate = mLast.isValid() ? mLast.format('jYYYY/jMM/jDD') : fallbackToDate;
        const fromMonthName = mFirst.isValid() ? monthsMap[mFirst.jMonth() + 1] || 'فروردین' : 'فروردین';
        const toMonthName = mLast.isValid() ? monthsMap[mLast.jMonth() + 1] || 'اسفند' : 'اسفند';
        return {
            success: true,
            hasVouchers: true,
            fromMonth: fromMonthName,
            toMonth: toMonthName,
            fromDate: fromJalaliDate,
            toDate: toJalaliDate,
            fromVoucher: String(minVoucherNum || 1),
            toVoucher: String(maxVoucherNum || 1),
        };
    }
    async getReportData(fromDate, toDate, verticalType, verticalValue, horizontalType, fromVoucher, toVoucher, includedDocsStr, voucherStatusStr, hasYearFilterStr, fromYear, toYear, hasMonthFilterStr, fromMonth, toMonth, hasDateFilterStr, fromCustomDate, toCustomDate, reportNature, reportVariant, accountLevel, columnFormat, balanceType, filterYearRangeStr, filterMonthsStr, filterDatesStr, filterVoucherNumbersStr, docTypesStr, statusesStr, searchStr, prioritiesStr, companyRefStr, businessStructureRefStr, isInternalCall) {
        let compId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() >= 1) ? this.requestContextService.getCompanyId() : 2;
        let bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() >= 1) ? this.requestContextService.getBusinessStructureId() : 2;
        if (companyRefStr) {
            const parsedComp = parseInt(companyRefStr, 10);
            if (!isNaN(parsedComp) && parsedComp >= 1)
                compId = parsedComp;
        }
        if (businessStructureRefStr) {
            const parsedBs = parseInt(businessStructureRefStr, 10);
            if (!isNaN(parsedBs) && parsedBs >= 1)
                bsId = parsedBs;
        }
        let includedDocs = { all: true, opening: false, closing: false, natureAdjustment: false, profitAndLoss: false, other: false };
        let voucherStatus = { all: true, temporary: false, underReview: false, checked: false, permanent: false };
        try {
            if (includedDocsStr)
                includedDocs = JSON.parse(includedDocsStr);
            if (voucherStatusStr)
                voucherStatus = JSON.parse(voucherStatusStr);
        }
        catch (e) {
        }
        const normalizeDigits = (str) => {
            if (!str)
                return '';
            return str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
                .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
        };
        let finalFromDate = normalizeDigits(fromDate);
        let finalToDate = normalizeDigits(toDate);
        if (hasYearFilterStr === 'true' || filterYearRangeStr === 'true') {
            try {
                const fyRepo = this.accountRepository.manager.getRepository(fiscal_year_entity_1.FiscalYear);
                const allFys = await fyRepo.find();
                if (fromYear) {
                    const cleanFrom = normalizeDigits(fromYear).trim();
                    const fromFy = allFys.find(f => String(f.fiscalYearID) === cleanFrom ||
                        f.title === fromYear ||
                        (f.title && f.title.includes(cleanFrom)));
                    if (fromFy) {
                        finalFromDate = typeof fromFy.startDate === 'string' ? fromFy.startDate : fromFy.startDate.toISOString().split('T')[0];
                    }
                }
                if (toYear) {
                    const cleanTo = normalizeDigits(toYear).trim();
                    const toFy = allFys.find(f => String(f.fiscalYearID) === cleanTo ||
                        f.title === toYear ||
                        (f.title && f.title.includes(cleanTo)));
                    if (toFy) {
                        finalToDate = typeof toFy.endDate === 'string' ? toFy.endDate : toFy.endDate.toISOString().split('T')[0];
                    }
                }
            }
            catch (err) {
                console.error('Error in fiscal year date resolution', err);
            }
        }
        if (hasMonthFilterStr === 'true' || filterMonthsStr === 'true') {
            const monthsMap = {
                'فروردین': 1, 'اردیبهشت': 2, 'خرداد': 3,
                'تیر': 4, 'مرداد': 5, 'شهریور': 6,
                'مهر': 7, 'آبان': 8, 'آذر': 9,
                'دی': 10, 'بهمن': 11, 'اسفند': 12
            };
            try {
                const mStart = (0, moment_jalaali_1.default)(finalFromDate || fromDate || '1403/01/01', 'jYYYY/jMM/jDD');
                const jYear = mStart.isValid() ? mStart.jYear() : 1403;
                const fromMonthIdx = monthsMap[fromMonth || 'فروردین'] || 1;
                const toMonthIdx = monthsMap[toMonth || 'اسفند'] || 12;
                const startJalaliStr = `${jYear}/${String(fromMonthIdx).padStart(2, '0')}/01`;
                const endMonthLastDay = toMonthIdx <= 6 ? 31 : (toMonthIdx <= 11 ? 30 : 29);
                const endJalaliStr = `${jYear}/${String(toMonthIdx).padStart(2, '0')}/${endMonthLastDay}`;
                finalFromDate = (0, moment_jalaali_1.default)(startJalaliStr, 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD');
                const mEnd = (0, moment_jalaali_1.default)(endJalaliStr, 'jYYYY/jMM/jDD');
                if (toMonthIdx === 12 && mEnd.isValid()) {
                    mEnd.add(1, 'month').startOf('month').subtract(1, 'day');
                }
                finalToDate = mEnd.locale('en').format('YYYY-MM-DD');
            }
            catch (err) {
                console.error('Error in month range calculation', err);
            }
        }
        if (hasDateFilterStr === 'true' || filterDatesStr === 'true') {
            const cleanFromCustom = normalizeDigits(fromCustomDate || fromDate || '');
            const cleanToCustom = normalizeDigits(toCustomDate || toDate || '');
            try {
                if (cleanFromCustom) {
                    if (cleanFromCustom.includes('/')) {
                        finalFromDate = (0, moment_jalaali_1.default)(cleanFromCustom, 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD');
                    }
                    else {
                        finalFromDate = cleanFromCustom;
                    }
                }
                if (cleanToCustom) {
                    if (cleanToCustom.includes('/')) {
                        finalToDate = (0, moment_jalaali_1.default)(cleanToCustom, 'jYYYY/jMM/jDD').locale('en').format('YYYY-MM-DD');
                    }
                    else {
                        finalToDate = cleanToCustom;
                    }
                }
            }
            catch (err) {
                console.error('Error in custom date normalization/calculation', err);
            }
        }
        finalFromDate = normalizeDigits(finalFromDate);
        finalToDate = normalizeDigits(finalToDate);
        const { isShared } = await this.getScope();
        const accountWhere = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        const allAccounts = await this.accountRepository.find({ where: accountWhere });
        const accountMap = new Map(allAccounts.map(a => [a.id, a]));
        const levelsMap = new Map();
        const roots = allAccounts.filter(x => x.code === '0');
        roots.forEach(r => {
            levelsMap.set(r.id, 0);
            const setLevel = (parentIds, currentLevel) => {
                const children = allAccounts.filter(x => x.parentId && parentIds.includes(x.parentId));
                if (children.length > 0) {
                    children.forEach(c => levelsMap.set(c.id, currentLevel));
                    setLevel(children.map(c => c.id), currentLevel + 1);
                }
            };
            setLevel([r.id], 1);
        });
        const getAncestors = (accountId) => {
            const numId = Number(accountId);
            const path = [];
            let curr = accountMap.get(numId);
            const visited = new Set();
            while (curr && !visited.has(curr.id)) {
                visited.add(curr.id);
                path.unshift(curr);
                curr = curr.parentId ? accountMap.get(curr.parentId) : undefined;
            }
            const cleanPath = path.filter(x => x.code !== '0');
            let group = cleanPath.find(x => levelsMap.get(x.id) === 1) || null;
            let total = cleanPath.find(x => levelsMap.get(x.id) === 2) || null;
            let specific = cleanPath.find(x => levelsMap.get(x.id) === 3) || null;
            if (!group && cleanPath[0])
                group = cleanPath[0];
            if (!total && cleanPath[1])
                total = cleanPath[1];
            if (!specific && cleanPath[2])
                specific = cleanPath[2];
            if (!specific && cleanPath.length > 0) {
                specific = cleanPath[cleanPath.length - 1];
            }
            return { group, total, specific };
        };
        const query = this.voucherItemRepository
            .createQueryBuilder('item')
            .innerJoinAndSelect('item.voucher', 'v')
            .where('v.companyRef = :compId', { compId })
            .andWhere('v.businessStructureRef = :bsId', { bsId });
        if (finalFromDate) {
            query.andWhere('v.voucherDate >= :finalFromDate', { finalFromDate });
        }
        if (finalToDate) {
            query.andWhere('v.voucherDate <= :finalToDate', { finalToDate });
        }
        if (fromVoucher && (filterVoucherNumbersStr === 'true' || !filterVoucherNumbersStr)) {
            const cleanNum = fromVoucher.replace(/\D/g, '');
            if (cleanNum) {
                query.andWhere('v.voucherNumber >= :fromVNum', { fromVNum: parseInt(cleanNum, 10) });
            }
        }
        if (toVoucher && (filterVoucherNumbersStr === 'true' || !filterVoucherNumbersStr)) {
            const cleanNum = toVoucher.replace(/\D/g, '');
            if (cleanNum) {
                query.andWhere('v.voucherNumber <= :toVNum', { toVNum: parseInt(cleanNum, 10) });
            }
        }
        if (docTypesStr && docTypesStr !== 'all') {
            const parts = docTypesStr.split(',');
            const types = [];
            if (parts.includes('opening'))
                types.push('افتتاحیه');
            if (parts.includes('closing'))
                types.push('اختتامیه');
            if (parts.includes('nature'))
                types.push('تعدیل ماهیت');
            if (parts.includes('pnl'))
                types.push('سود و زیان');
            if (parts.includes('normal'))
                types.push('عادی', 'سایر');
            if (types.length > 0) {
                query.andWhere('v.voucherNature IN (:...types)', { types });
            }
            else {
                query.andWhere('1 = 0');
            }
        }
        else if (includedDocsStr && !includedDocs.all) {
            const types = [];
            if (includedDocs.opening)
                types.push('افتتاحیه');
            if (includedDocs.closing)
                types.push('اختتامیه');
            if (includedDocs.natureAdjustment)
                types.push('تعدیل ماهیت');
            if (includedDocs.profitAndLoss)
                types.push('سود و زیان');
            if (includedDocs.other)
                types.push('سایر');
            if (types.length > 0) {
                query.andWhere('v.voucherNature IN (:...types)', { types });
            }
            else {
                query.andWhere('1 = 0');
            }
        }
        if (statusesStr && statusesStr !== 'all') {
            const parts = statusesStr.split(',');
            const stList = [];
            if (parts.includes('temporary'))
                stList.push(2);
            if (parts.includes('reviewing'))
                stList.push(3);
            if (parts.includes('reviewed'))
                stList.push(4);
            if (parts.includes('permanent'))
                stList.push(5, 9);
            if (stList.length > 0) {
                query.andWhere('v.status IN (:...stList)', { stList });
            }
            else {
                query.andWhere('1 = 0');
            }
        }
        else if (voucherStatusStr && !voucherStatus.all) {
            const statuses = [];
            if (voucherStatus.temporary)
                statuses.push(2);
            if (voucherStatus.underReview)
                statuses.push(3);
            if (voucherStatus.checked)
                statuses.push(4);
            if (voucherStatus.permanent)
                statuses.push(5, 9);
            if (statuses.length > 0) {
                query.andWhere('v.status IN (:...statuses)', { statuses });
            }
            else {
                query.andWhere('1 = 0');
            }
        }
        const qSearch = searchStr || '';
        if (qSearch.trim()) {
            const term = `%${qSearch.trim()}%`;
            query.andWhere('(item.description ILIKE :term OR v.description ILIKE :term OR v.voucherNumber::text ILIKE :term)', { term });
        }
        let rawItems = await query.getMany();
        const detaileds = await this.detailedAccountRepository.find({ where: accountWhere });
        const detailedAccountMap = new Map(detaileds.map(d => [d.detailedAccountId, d]));
        const detailedAccountMapById = new Map();
        const detailedAccountMapByCode = new Map();
        detaileds.forEach(d => {
            detailedAccountMapById.set(d.detailedAccountId, d);
            detailedAccountMapById.set(Number(d.detailedAccountId), d);
            detailedAccountMapById.set(String(d.detailedAccountId), d);
            if (d.code) {
                detailedAccountMapByCode.set(d.code.trim(), d);
                detailedAccountMapByCode.set(String(d.code).trim(), d);
            }
        });
        const getDetailedIdForLevel = (itemObj, dIdx) => {
            const val = itemObj[`detailedAccountId${dIdx}`] ||
                itemObj[`DetailedAccountID${dIdx}`] ||
                itemObj[`detailedAccountId_${dIdx}`] ||
                itemObj[`detailedAccount${dIdx}Id`];
            return val || null;
        };
        const findDetailedAccount = (idOrCode) => {
            if (idOrCode === null || idOrCode === undefined || idOrCode === '')
                return null;
            return detailedAccountMapById.get(Number(idOrCode)) ||
                detailedAccountMapById.get(String(idOrCode)) ||
                detailedAccountMapByCode.get(String(idOrCode).trim()) ||
                null;
        };
        const getDetailedAccountForType = (item, typeId) => {
            for (let i = 1; i <= 10; i++) {
                const daId = item[`detailedAccountId${i}`];
                if (daId) {
                    const da = detailedAccountMap.get(Number(daId));
                    if (da && da.detailedTypesId === typeId) {
                        return da;
                    }
                }
            }
            return null;
        };
        if (reportNature) {
            let activePriorities = [];
            if (prioritiesStr) {
                const parsed = prioritiesStr.split(',').map(p => p.trim());
                for (const p of parsed) {
                    if (!p || p === 'خالی باشد' || p === 'none')
                        break;
                    activePriorities.push(p);
                }
            }
            if (activePriorities.length === 0) {
                activePriorities = [accountLevel || 'معین'];
            }
            if (reportNature === 'ledger') {
                let runningBal = 0;
                const ledgerItems = rawItems.map((item, idx) => {
                    const ancestors = getAncestors(item.accountId);
                    const dVal = Number(item.debit || 0);
                    const cVal = Number(item.credit || 0);
                    runningBal += (dVal - cVal);
                    const docType = item.voucher?.voucherNature === 'افتتاحیه' ? 'opening'
                        : item.voucher?.voucherNature === 'اختتامیه' ? 'closing'
                            : item.voucher?.voucherNature === 'تعدیل ماهیت' ? 'nature'
                                : item.voucher?.voucherNature === 'سود و زیان' ? 'pnl' : 'normal';
                    const status = item.voucher?.status === 2 ? 'temporary'
                        : item.voucher?.status === 3 ? 'reviewing'
                            : item.voucher?.status === 4 ? 'reviewed' : 'permanent';
                    return {
                        id: item.voucherItemId || idx + 1,
                        rowNo: idx + 1,
                        voucherNumber: item.voucher?.voucherNumber || idx + 1,
                        referenceNumber: item.voucher?.referenceNumber || idx + 1,
                        subNumber: item.voucher?.subNumber || 1,
                        voucherDate: item.voucher?.voucherDate || '',
                        description: item.description || item.voucher?.description || '',
                        description2: item.voucher?.description2 || '',
                        debit: dVal,
                        credit: cVal,
                        runningBalance: Math.abs(runningBal),
                        balanceType: runningBal > 0 ? 'bed' : runningBal < 0 ? 'bes' : '-',
                        currency: item.currencyId ? 'ارز' : 'ریال',
                        currencyDebit: Number(item.currencyAmount || 0),
                        currencyCredit: 0,
                        trackingNumber: item.trackingNumber || '',
                        trackingDate: item.trackingDate || '',
                        accountCode: item.account?.code || ancestors.specific?.code || String(item.accountId),
                        accountTitle: item.account?.title || ancestors.specific?.title || 'حساب',
                        accountTitle2: item.account?.title_en || ancestors.specific?.title_en || '',
                        parentCode: ancestors.total?.code || ancestors.group?.code || '',
                        parentTitle: ancestors.total?.title || ancestors.group?.title || '',
                        accountLevel: ancestors.specific ? 'subsidiary' : ancestors.total ? 'general' : 'group',
                        docType,
                        status
                    };
                });
                let finalReportData = ledgerItems;
                if (balanceType === 'debit')
                    finalReportData = finalReportData.filter(x => x.debit > 0);
                else if (balanceType === 'credit')
                    finalReportData = finalReportData.filter(x => x.credit > 0);
                return {
                    success: true,
                    reportData: finalReportData
                };
            }
            const aggregatedMap = new Map();
            rawItems.forEach((item, idx) => {
                const ancestors = getAncestors(item.accountId);
                let code = '';
                let title = '';
                let title2 = '';
                let pCode = '';
                let pTitle = '';
                if (reportVariant === 'analytical') {
                    const keyParts = [];
                    const labelParts = [];
                    let missingRequiredDetailed = false;
                    for (const p of activePriorities) {
                        const normP = normalizeDigits(p);
                        if (normP === 'گروه' && ancestors.group) {
                            keyParts.push(`grp_${ancestors.group.code}`);
                            labelParts.push({ code: ancestors.group.code, title: ancestors.group.title, title2: ancestors.group.title_en });
                        }
                        else if (normP === 'کل' && ancestors.total) {
                            keyParts.push(`tot_${ancestors.total.code}`);
                            labelParts.push({ code: ancestors.total.code, title: ancestors.total.title, title2: ancestors.total.title_en });
                        }
                        else if (normP === 'معین' && ancestors.specific) {
                            keyParts.push(`spec_${ancestors.specific.code}`);
                            labelParts.push({ code: ancestors.specific.code, title: ancestors.specific.title, title2: ancestors.specific.title_en });
                        }
                        else if (normP.includes('تفصیلی')) {
                            const matches = normP.match(/\d+/g);
                            const dIdxs = (matches && matches.length > 0) ? matches.map(m => parseInt(m, 10)) : [1];
                            for (const dIdx of dIdxs) {
                                const daId = getDetailedIdForLevel(item, dIdx);
                                if (!daId) {
                                    missingRequiredDetailed = true;
                                    break;
                                }
                                const da = findDetailedAccount(daId);
                                if (da) {
                                    keyParts.push(`det_${dIdx}_${da.code || da.detailedAccountId}`);
                                    labelParts.push({
                                        code: da.code || String(da.detailedAccountId),
                                        title: da.title || '',
                                        title2: da.description || da.title_en || ''
                                    });
                                }
                                else {
                                    keyParts.push(`det_${dIdx}_${daId}`);
                                    labelParts.push({ code: String(daId), title: `تفصیلی ${daId}` });
                                }
                            }
                        }
                        if (missingRequiredDetailed)
                            break;
                    }
                    if (missingRequiredDetailed) {
                        return;
                    }
                    const compositeKey = keyParts.join('-') || (ancestors.specific?.code || item.accountId.toString());
                    const primaryLabel = labelParts[0] || {
                        code: ancestors.specific?.code || ancestors.total?.code || ancestors.group?.code || String(item.accountId),
                        title: ancestors.specific?.title || ancestors.total?.title || ancestors.group?.title || 'حساب',
                        title2: ancestors.specific?.title_en || ''
                    };
                    const parentLabel = labelParts[1] || {
                        code: ancestors.total?.code || ancestors.group?.code || ancestors.specific?.code || '',
                        title: ancestors.total?.title || ancestors.group?.title || ancestors.specific?.title || ''
                    };
                    code = primaryLabel.code;
                    title = primaryLabel.title;
                    title2 = primaryLabel.title2 || '';
                    pCode = parentLabel.code;
                    pTitle = parentLabel.title;
                    const detMapObj = {};
                    for (let d = 1; d <= 10; d++) {
                        const daId = getDetailedIdForLevel(item, d);
                        const da = daId ? findDetailedAccount(daId) : null;
                        detMapObj[`detailed${d}Code`] = da?.code || (daId ? String(daId) : '');
                        detMapObj[`detailed${d}Title`] = da?.title || (daId ? `تفصیلی ${daId}` : '');
                    }
                    if (!aggregatedMap.has(compositeKey)) {
                        aggregatedMap.set(compositeKey, {
                            id: idx + 1,
                            accountCode: code,
                            accountTitle: title,
                            accountTitle2: title2,
                            parentCode: pCode,
                            parentTitle: pTitle,
                            groupCode: ancestors.group?.code || '',
                            groupTitle: ancestors.group?.title || '',
                            kolCode: ancestors.total?.code || '',
                            kolTitle: ancestors.total?.title || '',
                            moinCode: ancestors.specific?.code || '',
                            moinTitle: ancestors.specific?.title || '',
                            ...detMapObj,
                            debit: 0,
                            credit: 0,
                            openingDebit: 0,
                            openingCredit: 0,
                            priorDebit: 0,
                            priorCredit: 0,
                            periodDebit: 0,
                            periodCredit: 0,
                        });
                    }
                    const agg = aggregatedMap.get(compositeKey);
                    for (let d = 1; d <= 10; d++) {
                        if (!agg[`detailed${d}Code`] && detMapObj[`detailed${d}Code`]) {
                            agg[`detailed${d}Code`] = detMapObj[`detailed${d}Code`];
                            agg[`detailed${d}Title`] = detMapObj[`detailed${d}Title`];
                        }
                    }
                    const dVal = Number(item.debit || 0);
                    const cVal = Number(item.credit || 0);
                    agg.debit += dVal;
                    agg.credit += cVal;
                    if (item.voucher?.voucherNature === 'افتتاحیه') {
                        agg.openingDebit += dVal;
                        agg.openingCredit += cVal;
                    }
                    else {
                        agg.periodDebit += dVal;
                        agg.periodCredit += cVal;
                    }
                }
                else {
                    let detailedLevelIndex = null;
                    if (accountLevel) {
                        const normalizedLevel = normalizeDigits(accountLevel);
                        const match = normalizedLevel.match(/سطح\s*تفصیلی\s*(\d+)/i) || normalizedLevel.match(/تفصیلی\s*(\d+)/i);
                        if (match) {
                            detailedLevelIndex = parseInt(match[1], 10);
                        }
                    }
                    if (detailedLevelIndex !== null && detailedLevelIndex >= 1 && detailedLevelIndex <= 10) {
                        const daIdProp = `detailedAccountId${detailedLevelIndex}`;
                        const daId = item[daIdProp];
                        if (daId) {
                            const da = detailedAccountMap.get(Number(daId));
                            if (da) {
                                const groupKey = `det_${detailedLevelIndex}_${da.detailedAccountId}`;
                                code = da.code || '';
                                title = da.title || '';
                                title2 = da.description || da.title_en || '';
                                pCode = ancestors.specific?.code || ancestors.total?.code || ancestors.group?.code || '';
                                pTitle = ancestors.specific?.title || ancestors.total?.title || ancestors.group?.title || '';
                                if (!aggregatedMap.has(groupKey)) {
                                    aggregatedMap.set(groupKey, {
                                        id: idx + 1,
                                        accountCode: code,
                                        accountTitle: title,
                                        accountTitle2: title2,
                                        parentCode: pCode,
                                        parentTitle: pTitle,
                                        debit: 0,
                                        credit: 0,
                                        openingDebit: 0,
                                        openingCredit: 0,
                                        priorDebit: 0,
                                        priorCredit: 0,
                                        periodDebit: 0,
                                        periodCredit: 0,
                                    });
                                }
                                const agg = aggregatedMap.get(groupKey);
                                const dVal = Number(item.debit || 0);
                                const cVal = Number(item.credit || 0);
                                agg.debit += dVal;
                                agg.credit += cVal;
                                if (item.voucher?.voucherNature === 'افتتاحیه') {
                                    agg.openingDebit += dVal;
                                    agg.openingCredit += cVal;
                                }
                                else {
                                    agg.periodDebit += dVal;
                                    agg.periodCredit += cVal;
                                }
                            }
                        }
                    }
                    else {
                        let keyObj = ancestors.specific;
                        if (accountLevel === 'گروه')
                            keyObj = ancestors.group;
                        else if (accountLevel === 'کل')
                            keyObj = ancestors.total;
                        else if (accountLevel === 'معین')
                            keyObj = ancestors.specific;
                        const groupKey = keyObj?.code || String(item.accountId);
                        code = keyObj?.code || '';
                        title = keyObj?.title || '';
                        title2 = keyObj?.title_en || '';
                        pCode = ancestors.group?.code || '';
                        pTitle = ancestors.group?.title || '';
                        if (!aggregatedMap.has(groupKey)) {
                            aggregatedMap.set(groupKey, {
                                id: idx + 1,
                                accountCode: code,
                                accountTitle: title,
                                accountTitle2: title2,
                                parentCode: pCode,
                                parentTitle: pTitle,
                                debit: 0,
                                credit: 0,
                                openingDebit: 0,
                                openingCredit: 0,
                                priorDebit: 0,
                                priorCredit: 0,
                                periodDebit: 0,
                                periodCredit: 0,
                            });
                        }
                        const agg = aggregatedMap.get(groupKey);
                        const dVal = Number(item.debit || 0);
                        const cVal = Number(item.credit || 0);
                        agg.debit += dVal;
                        agg.credit += cVal;
                        if (item.voucher?.voucherNature === 'افتتاحیه') {
                            agg.openingDebit += dVal;
                            agg.openingCredit += cVal;
                        }
                        else {
                            agg.periodDebit += dVal;
                            agg.periodCredit += cVal;
                        }
                    }
                }
            });
            const computedList = Array.from(aggregatedMap.values()).map((agg, idx) => {
                const diff = agg.debit - agg.credit;
                const debitBal = diff > 0 ? diff : 0;
                const creditBal = diff < 0 ? Math.abs(diff) : 0;
                return {
                    id: agg.id,
                    rowNo: idx + 1,
                    accountCode: agg.accountCode,
                    accountTitle: agg.accountTitle,
                    accountTitle2: agg.accountTitle2,
                    parentCode: agg.parentCode,
                    parentTitle: agg.parentTitle,
                    debit: agg.debit,
                    credit: agg.credit,
                    debitBalance: debitBal,
                    creditBalance: creditBal,
                    debitTurnover: agg.debit,
                    creditTurnover: agg.credit,
                    debitPriorTurnover: agg.priorDebit,
                    creditPriorTurnover: agg.priorCredit,
                    debitPeriodTurnover: agg.periodDebit,
                    creditPeriodTurnover: agg.periodCredit,
                    col1Debit: agg.openingDebit,
                    col1Credit: agg.openingCredit,
                    col2Debit: agg.priorDebit,
                    col2Credit: agg.priorCredit,
                    col3Debit: agg.periodDebit,
                    col3Credit: agg.periodCredit,
                    col4Debit: debitBal,
                    col4Credit: creditBal,
                };
            });
            let finalReportData = computedList;
            if (balanceType === 'debit')
                finalReportData = finalReportData.filter(x => x.debitBalance > 0);
            else if (balanceType === 'credit')
                finalReportData = finalReportData.filter(x => x.creditBalance > 0);
            else if (balanceType === 'zero_no_balance')
                finalReportData = finalReportData.filter(x => x.debitBalance === 0 && x.creditBalance === 0);
            return {
                success: true,
                reportData: finalReportData
            };
        }
        const filteredItems = rawItems.filter(item => {
            const ancestors = getAncestors(item.accountId);
            if (!verticalValue || verticalValue === 'all') {
                if (verticalType && verticalType !== horizontalType) {
                    if (verticalType.startsWith('detailedType_')) {
                        const typeId = parseInt(verticalType.split('_')[1], 10);
                        return getDetailedAccountForType(item, typeId) !== null;
                    }
                    if (verticalType.startsWith('detailed_')) {
                        const index = parseInt(verticalType.split('_')[1], 10);
                        const prop = `detailedAccountId${index}`;
                        return item[prop] != null;
                    }
                    switch (verticalType) {
                        case 'branch':
                            return item.voucher?.businessStructureRef != null;
                        case 'group':
                            return ancestors.group !== null;
                        case 'total':
                            return ancestors.total !== null;
                        case 'specific':
                            return ancestors.specific !== null;
                        case 'currency':
                            return item.currencyId != null;
                        case 'tracking':
                            return item.trackingNumber && item.trackingNumber.trim() !== '';
                    }
                }
                return true;
            }
            if (verticalType && verticalType.startsWith('detailedType_')) {
                const typeId = parseInt(verticalType.split('_')[1], 10);
                const da = getDetailedAccountForType(item, typeId);
                return da && da.detailedAccountId.toString() === verticalValue;
            }
            if (verticalType && verticalType.startsWith('detailed_')) {
                const index = parseInt(verticalType.split('_')[1], 10);
                const prop = `detailedAccountId${index}`;
                return item[prop] && item[prop].toString() === verticalValue;
            }
            switch (verticalType) {
                case 'branch':
                    return item.voucher && item.voucher.businessStructureRef && item.voucher.businessStructureRef.toString() === verticalValue;
                case 'group':
                    return ancestors.group && ancestors.group.id.toString() === verticalValue;
                case 'total':
                    return ancestors.total && ancestors.total.id.toString() === verticalValue;
                case 'specific':
                    return ancestors.specific && ancestors.specific.id.toString() === verticalValue;
                case 'currency':
                    return item.currencyId && item.currencyId.toString() === verticalValue;
                case 'tracking':
                    return item.trackingNumber === verticalValue;
                default:
                    return false;
            }
        });
        const horizontalConfig = {
            group: true,
            total: filteredItems.some(x => getAncestors(x.accountId).total !== null),
            specific: filteredItems.some(x => getAncestors(x.accountId).specific !== null),
            currency: filteredItems.some(x => x.currencyId !== null),
            tracking: filteredItems.some(x => x.trackingNumber && x.trackingNumber.trim() !== ''),
            branch: filteredItems.some(x => x.voucher && x.voucher.businessStructureRef !== null),
        };
        for (let i = 1; i <= 10; i++) {
            horizontalConfig[`detailed_${i}`] = filteredItems.some(x => x[`detailedAccountId${i}`] !== null);
        }
        try {
            const dtRepo = this.accountRepository.manager.getRepository(detailed_type_entity_1.DetailedType);
            const allDetailedTypes = await dtRepo.find({ where: { isActive: true } });
            for (const dt of allDetailedTypes) {
                const typeId = dt.detailedTypesId;
                horizontalConfig[`detailedType_${typeId}`] = filteredItems.some(x => getDetailedAccountForType(x, typeId) !== null);
            }
            if (verticalType && verticalType.startsWith('detailedType_')) {
                const typeId = parseInt(verticalType.split('_')[1], 10);
                horizontalConfig[`detailedType_${typeId}`] = false;
            }
            if (verticalType &&
                (verticalType.startsWith('detailed_') || verticalType.startsWith('detailedType_')) &&
                verticalValue &&
                verticalValue !== 'all') {
                const selectedDa = detailedAccountMap.get(Number(verticalValue));
                if (selectedDa && selectedDa.detailedTypesId) {
                    horizontalConfig[`detailedType_${selectedDa.detailedTypesId}`] = false;
                }
            }
        }
        catch (err) {
            console.error('Error computing detailedType horizontalConfig', err);
        }
        const itemsForTable = (horizontalType === verticalType && verticalValue !== 'all') ? rawItems : filteredItems;
        const groupedData = new Map();
        const rawItemsForTableWithKeys = [];
        let currencyMap = new Map();
        if (horizontalType === 'currency') {
            const currencies = await this.currencyRepository.find({ where: accountWhere });
            currencyMap = new Map(currencies.map(c => [c.currencyID, c]));
        }
        let branchMap = new Map();
        if (horizontalType === 'branch') {
            const bsRepo = this.accountRepository.manager.getRepository(business_structure_entity_1.BusinessStructure);
            const branches = await bsRepo.find();
            branchMap = new Map(branches.map(b => [b.businessStructureId, b]));
        }
        itemsForTable.forEach(item => {
            const ancestors = getAncestors(item.accountId);
            let groupKey = '';
            let code = '';
            let title = '';
            if (horizontalType && horizontalType.startsWith('detailedType_')) {
                const typeId = parseInt(horizontalType.split('_')[1], 10);
                const da = getDetailedAccountForType(item, typeId);
                if (da) {
                    groupKey = da.detailedAccountId.toString();
                    code = da.code;
                    title = da.title;
                }
            }
            else if (horizontalType && horizontalType.startsWith('detailed_')) {
                const index = parseInt(horizontalType.split('_')[1], 10);
                const detailedId = item[`detailedAccountId${index}`];
                if (detailedId) {
                    groupKey = detailedId.toString();
                    const d = detailedAccountMap.get(Number(detailedId));
                    code = d?.code || '';
                    title = d?.title || '';
                }
            }
            else {
                switch (horizontalType) {
                    case 'branch':
                        if (item.voucher && item.voucher.businessStructureRef) {
                            groupKey = item.voucher.businessStructureRef.toString();
                            const b = branchMap.get(Number(groupKey));
                            code = b?.code || '';
                            title = b?.title || '';
                        }
                        break;
                    case 'group':
                        if (ancestors.group) {
                            groupKey = ancestors.group.id.toString();
                            code = ancestors.group.code;
                            title = ancestors.group.title;
                        }
                        break;
                    case 'total':
                        if (ancestors.total) {
                            groupKey = ancestors.total.id.toString();
                            code = ancestors.total.code;
                            title = ancestors.total.title;
                        }
                        break;
                    case 'specific':
                        if (ancestors.specific) {
                            groupKey = ancestors.specific.id.toString();
                            code = ancestors.specific.code;
                            title = ancestors.specific.title;
                        }
                        break;
                    case 'currency':
                        if (item.currencyId) {
                            groupKey = item.currencyId.toString();
                            const curr = currencyMap.get(item.currencyId);
                            code = curr?.code?.toString() || '';
                            title = curr?.title || '';
                        }
                        break;
                    case 'tracking':
                        if (item.trackingNumber) {
                            groupKey = item.trackingNumber;
                            code = item.trackingNumber;
                            title = item.trackingNumber;
                        }
                        break;
                }
            }
            if (!groupKey)
                return;
            if (isInternalCall) {
                rawItemsForTableWithKeys.push({ item, groupKey, accountCode: code, accountTitle: title });
            }
            const existing = groupedData.get(groupKey) || { code, title, debit: 0, credit: 0 };
            existing.debit += Number(item.debit || 0);
            existing.credit += Number(item.credit || 0);
            groupedData.set(groupKey, existing);
        });
        const reportData = Array.from(groupedData.entries()).map(([id, val]) => {
            const balance = val.debit - val.credit;
            let balanceType = 'بی‌حساب';
            if (balance > 0)
                balanceType = 'بدهکار';
            else if (balance < 0)
                balanceType = 'بستانکار';
            return {
                id,
                code: val.code,
                title: val.title,
                debit: val.debit,
                credit: val.credit,
                balance: Math.abs(balance),
                balanceType,
            };
        });
        return {
            success: true,
            reportData,
            horizontalConfig,
            rawItemsForTableWithKeys,
        };
    }
    async getHistory(fromDate, toDate, verticalType, verticalValue, horizontalType, fromVoucher, toVoucher, includedDocsStr, voucherStatusStr, hasYearFilterStr, fromYear, toYear, hasMonthFilterStr, fromMonth, toMonth, hasDateFilterStr, fromCustomDate, toCustomDate, selectedId) {
        const rawRes = await this.getReportData(fromDate, toDate, verticalType, verticalValue, horizontalType, fromVoucher, toVoucher, includedDocsStr, voucherStatusStr, hasYearFilterStr, fromYear, toYear, hasMonthFilterStr, fromMonth, toMonth, hasDateFilterStr, fromCustomDate, toCustomDate, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
        const matchItems = rawRes.rawItemsForTableWithKeys?.filter(x => x.groupKey === selectedId) || [];
        matchItems.sort((a, b) => {
            const dbA = a.item.voucher?.voucherDate ? new Date(a.item.voucher.voucherDate).getTime() : 0;
            const dbB = b.item.voucher?.voucherDate ? new Date(b.item.voucher.voucherDate).getTime() : 0;
            return dbA - dbB;
        });
        let runningBalance = 0;
        const reportData = matchItems.map((wrapper) => {
            const { item, accountCode, accountTitle } = wrapper;
            runningBalance += Number(item.debit || 0) - Number(item.credit || 0);
            let runningBalanceType = 'بی‌حساب';
            if (runningBalance > 0)
                runningBalanceType = 'بدهکار';
            else if (runningBalance < 0)
                runningBalanceType = 'بستانکار';
            return {
                id: item.voucherItemId,
                voucherId: item.voucher?.voucherId,
                issueDate: item.voucher?.voucherDate ? new Date(item.voucher.voucherDate).toISOString().split('T')[0] : '',
                voucherNumber: item.voucher?.voucherNumber || '',
                dailyNumber: item.voucher?.dailyNumber || '',
                accountCode: accountCode || '',
                accountTitle: accountTitle || '',
                description: item.description || '',
                debit: Number(item.debit || 0),
                credit: Number(item.credit || 0),
                runningBalance: Math.abs(runningBalance),
                runningBalanceType,
                currencyName: '',
                currencyAmount: item.currencyAmount || '',
                currencyRate: item.exchangeRate || '',
                trackingNumber: item.trackingNumber || '',
                trackingDate: item.trackingDate ? new Date(item.trackingDate).toISOString().split('T')[0] : '',
                creatorName: '',
            };
        });
        return {
            success: true,
            reportData
        };
    }
};
exports.AccountReviewController = AccountReviewController;
__decorate([
    (0, common_1.Get)('sidebar-items'),
    __param(0, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccountReviewController.prototype, "getSidebarItems", null);
__decorate([
    (0, common_1.Get)('voucher-bounds'),
    __param(0, (0, common_1.Query)('fromYear')),
    __param(1, (0, common_1.Query)('toYear')),
    __param(2, (0, common_1.Query)('companyRef')),
    __param(3, (0, common_1.Query)('businessStructureRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountReviewController.prototype, "getVoucherBounds", null);
__decorate([
    (0, common_1.Get)('report-data'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __param(2, (0, common_1.Query)('verticalType')),
    __param(3, (0, common_1.Query)('verticalValue')),
    __param(4, (0, common_1.Query)('horizontalType')),
    __param(5, (0, common_1.Query)('fromVoucher')),
    __param(6, (0, common_1.Query)('toVoucher')),
    __param(7, (0, common_1.Query)('includedDocs')),
    __param(8, (0, common_1.Query)('voucherStatus')),
    __param(9, (0, common_1.Query)('hasYearFilter')),
    __param(10, (0, common_1.Query)('fromYear')),
    __param(11, (0, common_1.Query)('toYear')),
    __param(12, (0, common_1.Query)('hasMonthFilter')),
    __param(13, (0, common_1.Query)('fromMonth')),
    __param(14, (0, common_1.Query)('toMonth')),
    __param(15, (0, common_1.Query)('hasDateFilter')),
    __param(16, (0, common_1.Query)('fromCustomDate')),
    __param(17, (0, common_1.Query)('toCustomDate')),
    __param(18, (0, common_1.Query)('reportNature')),
    __param(19, (0, common_1.Query)('reportVariant')),
    __param(20, (0, common_1.Query)('accountLevel')),
    __param(21, (0, common_1.Query)('columnFormat')),
    __param(22, (0, common_1.Query)('balanceType')),
    __param(23, (0, common_1.Query)('filterYearRange')),
    __param(24, (0, common_1.Query)('filterMonths')),
    __param(25, (0, common_1.Query)('filterDates')),
    __param(26, (0, common_1.Query)('filterVoucherNumbers')),
    __param(27, (0, common_1.Query)('docTypes')),
    __param(28, (0, common_1.Query)('statuses')),
    __param(29, (0, common_1.Query)('search')),
    __param(30, (0, common_1.Query)('priorities')),
    __param(31, (0, common_1.Query)('companyRef')),
    __param(32, (0, common_1.Query)('businessStructureRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], AccountReviewController.prototype, "getReportData", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __param(2, (0, common_1.Query)('verticalType')),
    __param(3, (0, common_1.Query)('verticalValue')),
    __param(4, (0, common_1.Query)('horizontalType')),
    __param(5, (0, common_1.Query)('fromVoucher')),
    __param(6, (0, common_1.Query)('toVoucher')),
    __param(7, (0, common_1.Query)('includedDocs')),
    __param(8, (0, common_1.Query)('voucherStatus')),
    __param(9, (0, common_1.Query)('hasYearFilter')),
    __param(10, (0, common_1.Query)('fromYear')),
    __param(11, (0, common_1.Query)('toYear')),
    __param(12, (0, common_1.Query)('hasMonthFilter')),
    __param(13, (0, common_1.Query)('fromMonth')),
    __param(14, (0, common_1.Query)('toMonth')),
    __param(15, (0, common_1.Query)('hasDateFilter')),
    __param(16, (0, common_1.Query)('fromCustomDate')),
    __param(17, (0, common_1.Query)('toCustomDate')),
    __param(18, (0, common_1.Query)('selectedId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AccountReviewController.prototype, "getHistory", null);
exports.AccountReviewController = AccountReviewController = __decorate([
    (0, common_1.Controller)('accounting/account-review'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, typeorm_1.InjectRepository)(voucher_item_entity_1.VoucherItem)),
    __param(1, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __param(2, (0, typeorm_1.InjectRepository)(detailed_account_entity_1.DetailedAccount)),
    __param(3, (0, typeorm_1.InjectRepository)(currency_entity_1.Currency)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], AccountReviewController);
//# sourceMappingURL=account-review.controller.js.map
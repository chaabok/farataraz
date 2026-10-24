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
exports.TrialBalanceAndLedgerReportController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const voucher_item_entity_1 = require("../../domain/entities/voucher-item.entity");
const voucher_entity_1 = require("../../domain/entities/voucher.entity");
const account_entity_1 = require("../../domain/entities/account.entity");
const detailed_account_entity_1 = require("../../domain/entities/detailed-account.entity");
const currency_entity_1 = require("../../../common/domain/entities/currency.entity");
const fiscal_year_entity_1 = require("../../../common/domain/entities/fiscal-year.entity");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
let TrialBalanceAndLedgerReportController = class TrialBalanceAndLedgerReportController {
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
    async getVoucherBounds(fromYear, toYear, companyRefStr, businessStructureRefStr) {
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
    async getReportData(fromDate, toDate, verticalType, verticalValue, horizontalType, fromVoucher, toVoucher, includedDocsStr, voucherStatusStr, hasYearFilterStr, fromYear, toYear, hasMonthFilterStr, fromMonth, toMonth, hasDateFilterStr, fromCustomDate, toCustomDate, reportNature, reportVariant, accountLevel, columnFormat, balanceType, filterYearRangeStr, filterMonthsStr, filterDatesStr, filterVoucherNumbersStr, docTypesStr, statusesStr, searchStr, prioritiesStr, companyRefStr, businessStructureRefStr) {
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
            if (cleanFromCustom)
                finalFromDate = cleanFromCustom;
            if (cleanToCustom)
                finalToDate = cleanToCustom;
        }
        finalFromDate = normalizeDigits(finalFromDate);
        finalToDate = normalizeDigits(finalToDate);
        if (finalFromDate && (finalFromDate.includes('/') || /^(13|14)\d{2}/.test(finalFromDate))) {
            try {
                const m = (0, moment_jalaali_1.default)(finalFromDate, 'jYYYY/jMM/jDD');
                if (m.isValid()) {
                    finalFromDate = m.locale('en').format('YYYY-MM-DD');
                }
            }
            catch (err) {
                console.error('Error converting finalFromDate to Gregorian', err);
            }
        }
        if (finalToDate && (finalToDate.includes('/') || /^(13|14)\d{2}/.test(finalToDate))) {
            try {
                const m = (0, moment_jalaali_1.default)(finalToDate, 'jYYYY/jMM/jDD');
                if (m.isValid()) {
                    finalToDate = m.locale('en').format('YYYY-MM-DD');
                }
            }
            catch (err) {
                console.error('Error converting finalToDate to Gregorian', err);
            }
        }
        const { isShared } = await this.getScope();
        const allAccounts = await this.accountRepository.find();
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
            .innerJoinAndSelect('item.voucher', 'v');
        if (isShared) {
            query.where('(v.businessStructureRef = :bsId OR v.companyRef = :compId OR v.businessStructureRef >= 1 OR v.companyRef >= 1)', { bsId, compId });
        }
        else {
            query.where('(v.companyRef = :compId OR v.businessStructureRef = :bsId OR v.companyRef >= 1)', { compId, bsId });
        }
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
                if (parts.includes('normal')) {
                    query.andWhere('(v.voucherNature IN (:...types) OR v.voucherNature IS NULL)', { types });
                }
                else {
                    query.andWhere('v.voucherNature IN (:...types)', { types });
                }
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
                if (includedDocs.other) {
                    query.andWhere('(v.voucherNature IN (:...types) OR v.voucherNature IS NULL)', { types });
                }
                else {
                    query.andWhere('v.voucherNature IN (:...types)', { types });
                }
            }
            else {
                query.andWhere('1 = 0');
            }
        }
        if (statusesStr && statusesStr !== 'all') {
            const parts = statusesStr.split(',');
            const stList = [];
            if (parts.includes('temporary'))
                stList.push(1, 2);
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
                statuses.push(1, 2);
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
        const detaileds = await this.detailedAccountRepository.find();
        const detailedAccountMapById = new Map();
        const detailedAccountMapByCode = new Map();
        detaileds.forEach(d => {
            if (d.detailedAccountId !== undefined && d.detailedAccountId !== null) {
                detailedAccountMapById.set(Number(d.detailedAccountId), d);
                detailedAccountMapById.set(String(d.detailedAccountId), d);
            }
            if (d.code) {
                detailedAccountMapByCode.set(String(d.code).trim(), d);
            }
        });
        const findDetailedAccount = (idOrCode) => {
            if (idOrCode === null || idOrCode === undefined || idOrCode === '')
                return null;
            return detailedAccountMapById.get(Number(idOrCode)) ||
                detailedAccountMapById.get(String(idOrCode)) ||
                detailedAccountMapByCode.get(String(idOrCode).trim()) ||
                null;
        };
        const getDetailedIdForLevel = (itemObj, dIdx) => {
            const val = itemObj[`detailedAccountId${dIdx}`] ||
                itemObj[`DetailedAccountID${dIdx}`] ||
                itemObj[`detailedAccountId_${dIdx}`] ||
                itemObj[`detailedAccount${dIdx}Id`];
            return val || null;
        };
        let activePriorities = [];
        if (prioritiesStr) {
            let rawList = [];
            try {
                const parsed = JSON.parse(prioritiesStr);
                if (Array.isArray(parsed)) {
                    rawList = parsed;
                }
                else if (typeof parsed === 'string') {
                    rawList = parsed.split(',');
                }
            }
            catch (e) {
                rawList = prioritiesStr.split(',');
            }
            for (const p of rawList) {
                const cleanP = String(p || '').trim().replace(/^["'\[\]]+|["'\[\]]+$/g, '');
                if (!cleanP || cleanP === 'خالی باشد' || cleanP === 'none')
                    break;
                activePriorities.push(cleanP);
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
                const detMapObj = {};
                for (let d = 1; d <= 10; d++) {
                    const daId = getDetailedIdForLevel(item, d);
                    const da = daId ? findDetailedAccount(daId) : null;
                    detMapObj[`detailed${d}Code`] = da?.code || (daId ? String(daId) : '');
                    detMapObj[`detailed${d}Title`] = da?.title || (daId ? `تفصیلی ${daId}` : '');
                }
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
                    groupCode: ancestors.group?.code || '',
                    groupTitle: ancestors.group?.title || '',
                    kolCode: ancestors.total?.code || '',
                    kolTitle: ancestors.total?.title || '',
                    moinCode: item.account?.code || ancestors.specific?.code || '',
                    moinTitle: item.account?.title || ancestors.specific?.title || '',
                    ...detMapObj,
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
                const detMapObj = {};
                for (let d = 1; d <= 10; d++) {
                    const daId = getDetailedIdForLevel(item, d);
                    const da = daId ? findDetailedAccount(daId) : null;
                    detMapObj[`detailed${d}Code`] = da?.code || (daId ? String(daId) : '');
                    detMapObj[`detailed${d}Title`] = da?.title || (daId ? `تفصیلی ${daId}` : '');
                }
                let detailedLevelIndex = null;
                if (accountLevel) {
                    const normalizedLevel = normalizeDigits(accountLevel);
                    const match = normalizedLevel.match(/سطح\s*تفصیلی\s*(\d+)/i) || normalizedLevel.match(/تفصیلی\s*(\d+)/i);
                    if (match) {
                        detailedLevelIndex = parseInt(match[1], 10);
                    }
                }
                if (detailedLevelIndex !== null && detailedLevelIndex >= 1 && detailedLevelIndex <= 10) {
                    let daId = getDetailedIdForLevel(item, detailedLevelIndex);
                    if (daId) {
                        const da = findDetailedAccount(daId);
                        const groupKey = `det_${detailedLevelIndex}_${da?.code || daId}`;
                        code = da?.code || String(daId);
                        title = da?.title || `تفصیلی ${daId}`;
                        title2 = da?.description || da?.title_en || '';
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
                        const agg = aggregatedMap.get(groupKey);
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
                    const agg = aggregatedMap.get(groupKey);
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
                groupCode: agg.groupCode || '',
                groupTitle: agg.groupTitle || '',
                kolCode: agg.kolCode || '',
                kolTitle: agg.kolTitle || '',
                moinCode: agg.moinCode || '',
                moinTitle: agg.moinTitle || '',
                detailed1Code: agg.detailed1Code || '',
                detailed1Title: agg.detailed1Title || '',
                detailed2Code: agg.detailed2Code || '',
                detailed2Title: agg.detailed2Title || '',
                detailed3Code: agg.detailed3Code || '',
                detailed3Title: agg.detailed3Title || '',
                detailed4Code: agg.detailed4Code || '',
                detailed4Title: agg.detailed4Title || '',
                detailed5Code: agg.detailed5Code || '',
                detailed5Title: agg.detailed5Title || '',
                detailed6Code: agg.detailed6Code || '',
                detailed6Title: agg.detailed6Title || '',
                detailed7Code: agg.detailed7Code || '',
                detailed7Title: agg.detailed7Title || '',
                detailed8Code: agg.detailed8Code || '',
                detailed8Title: agg.detailed8Title || '',
                detailed9Code: agg.detailed9Code || '',
                detailed9Title: agg.detailed9Title || '',
                detailed10Code: agg.detailed10Code || '',
                detailed10Title: agg.detailed10Title || '',
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
};
exports.TrialBalanceAndLedgerReportController = TrialBalanceAndLedgerReportController;
__decorate([
    (0, common_1.Get)('voucher-bounds'),
    __param(0, (0, common_1.Query)('fromYear')),
    __param(1, (0, common_1.Query)('toYear')),
    __param(2, (0, common_1.Query)('companyRef')),
    __param(3, (0, common_1.Query)('businessStructureRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], TrialBalanceAndLedgerReportController.prototype, "getVoucherBounds", null);
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
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TrialBalanceAndLedgerReportController.prototype, "getReportData", null);
exports.TrialBalanceAndLedgerReportController = TrialBalanceAndLedgerReportController = __decorate([
    (0, common_1.Controller)(['accounting/trial-balance-and-ledger-report', 'accounting/trial-balance-report']),
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
], TrialBalanceAndLedgerReportController);
//# sourceMappingURL=trial-balance-and-ledger-report.controller.js.map
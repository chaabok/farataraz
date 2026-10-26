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
exports.NatureAdjustmentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const voucher_entity_1 = require("../../domain/entities/voucher.entity");
const voucher_item_entity_1 = require("../../domain/entities/voucher-item.entity");
const account_entity_1 = require("../../domain/entities/account.entity");
const detailed_account_entity_1 = require("../../domain/entities/detailed-account.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const voucher_service_1 = require("./voucher.service");
const account_service_1 = require("./account.service");
let NatureAdjustmentService = class NatureAdjustmentService {
    constructor(voucherItemRepository, voucherRepository, accountRepository, detailedAccountRepository, requestContextService, voucherService, accountService) {
        this.voucherItemRepository = voucherItemRepository;
        this.voucherRepository = voucherRepository;
        this.accountRepository = accountRepository;
        this.detailedAccountRepository = detailedAccountRepository;
        this.requestContextService = requestContextService;
        this.voucherService = voucherService;
        this.accountService = accountService;
    }
    async getScopeWhere(bsId, compId) {
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
        catch (e) {
            isShared = false;
        }
        return isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    }
    async getContraryBalances(fiscalYearId) {
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const compId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const whereScope = await this.getScopeWhere(bsId, compId);
        const accounts = await this.accountRepository.find({
            where: whereScope
        });
        const accountMap = new Map();
        accounts.forEach(a => accountMap.set(a.id, a));
        const details = await this.detailedAccountRepository.find({
            where: whereScope
        });
        const detailMap = new Map();
        details.forEach(d => detailMap.set(d.detailedAccountId, d));
        const currencies = await this.voucherItemRepository.manager.query('SELECT "CurrencyID", "Title" FROM "Gnr"."Currency"');
        const currencyMap = new Map();
        currencies.forEach((c) => currencyMap.set(Number(c.CurrencyID), c.Title));
        const qb = this.voucherItemRepository.createQueryBuilder('vi')
            .innerJoin('vi.voucher', 'v')
            .where('(v.fiscalYearRef = :fy OR v.fiscalYearRef IS NULL)', { fy: fiscalYearId })
            .andWhere('v.businessStructureRef = :bs', { bs: bsId })
            .andWhere('v.companyRef = :comp', { comp: compId })
            .select([
            'vi.accountId as "accountId"',
            'vi.detailedAccountId1 as "detailedAccountId1"',
            'vi.detailedAccountId2 as "detailedAccountId2"',
            'vi.detailedAccountId3 as "detailedAccountId3"',
            'vi.currencyId as "currencyId"',
            'SUM(vi.debit) as "totalDebit"',
            'SUM(vi.credit) as "totalCredit"',
        ])
            .groupBy('vi.accountId')
            .addGroupBy('vi.detailedAccountId1')
            .addGroupBy('vi.detailedAccountId2')
            .addGroupBy('vi.detailedAccountId3')
            .addGroupBy('vi.currencyId');
        const rawResults = await qb.getRawMany();
        const contraryLines = [];
        rawResults.forEach((row, idx) => {
            const accId = Number(row.accountId);
            const acc = accountMap.get(accId);
            if (!acc)
                return;
            const nature = acc.accountNature;
            if (!nature || nature === 7)
                return;
            const tDebit = Number(row.totalDebit) || 0;
            const tCredit = Number(row.totalCredit) || 0;
            const balance = tDebit - tCredit;
            let balanceNature = '';
            if (balance > 0)
                balanceNature = 'بدهکار';
            else if (balance < 0)
                balanceNature = 'بستانکار';
            else
                return;
            const isDebitNature = nature === 1 || nature === 3 || nature === 5;
            const isCreditNature = nature === 2 || nature === 4 || nature === 6;
            let isContrary = false;
            if (isDebitNature && balance < 0)
                isContrary = true;
            if (isCreditNature && balance > 0)
                isContrary = true;
            if (isContrary) {
                let accountNatureStr = 'مهم نیست';
                if (nature === 1)
                    accountNatureStr = 'بدهکار';
                else if (nature === 2)
                    accountNatureStr = 'بستانکار';
                else if (nature === 3)
                    accountNatureStr = 'بدهکار طی دوره';
                else if (nature === 4)
                    accountNatureStr = 'بستانکار طی دوره';
                else if (nature === 5)
                    accountNatureStr = 'بدهکار پایان دوره';
                else if (nature === 6)
                    accountNatureStr = 'بستانکار پایان دوره';
                const da1 = row.detailedAccountId1 ? detailMap.get(Number(row.detailedAccountId1)) : null;
                const da2 = row.detailedAccountId2 ? detailMap.get(Number(row.detailedAccountId2)) : null;
                const da3 = row.detailedAccountId3 ? detailMap.get(Number(row.detailedAccountId3)) : null;
                const kolAcc = acc.parentId ? accountMap.get(Number(acc.parentId)) : null;
                const groupAcc = kolAcc && kolAcc.parentId ? accountMap.get(Number(kolAcc.parentId)) : null;
                const counterpartiesList = [];
                if (acc.natureAdjustments) {
                    for (const na of acc.natureAdjustments) {
                        if (!na.moinCode)
                            continue;
                        const targetAcc = accounts.find(a => a.code === na.moinCode);
                        counterpartiesList.push({
                            id: targetAcc ? targetAcc.id : 0,
                            code: na.moinCode,
                            title: na.moinTitle || (targetAcc ? targetAcc.title : '')
                        });
                    }
                }
                const firstNatureAdjustment = counterpartiesList.length > 0 ? counterpartiesList[0] : null;
                const defaultCounterparty = firstNatureAdjustment ? firstNatureAdjustment.code : '';
                contraryLines.push({
                    _id: `fy${fiscalYearId}-${idx}`,
                    accountId: accId,
                    moinCode: acc.code,
                    moinTitle: acc.title,
                    kolTitle: kolAcc ? kolAcc.title : '',
                    groupTitle: groupAcc ? groupAcc.title : '',
                    tafsilCode: da1 ? da1.code : '',
                    tafsilTitle: da1 ? da1.title : '',
                    level5: da2 ? da2.code : '',
                    level5Title: da2 ? da2.title : '',
                    level6: da3 ? da3.code : '',
                    level6Title: da3 ? da3.title : '',
                    detailedAccountId1: row.detailedAccountId1,
                    detailedAccountId2: row.detailedAccountId2,
                    detailedAccountId3: row.detailedAccountId3,
                    currencyId: row.currencyId,
                    currencyTitle: row.currencyId ? (currencyMap.get(Number(row.currencyId)) || '') : '',
                    accountNature: accountNatureStr,
                    balance: Math.abs(balance),
                    balanceNature: balanceNature,
                    counterpartyAccount: defaultCounterparty,
                    counterpartyAccountObj: firstNatureAdjustment,
                    allowedCounterparties: counterpartiesList
                });
            }
        });
        return contraryLines;
    }
    async saveAdjustmentVoucher(payload) {
        const { fiscalYearId, voucherDate, lines } = payload;
        if (!lines || lines.length === 0) {
            throw new common_1.BadRequestException('No adjustment lines provided');
        }
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const compId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const whereScope = await this.getScopeWhere(bsId, compId);
        const accounts = await this.accountRepository.find({
            where: whereScope
        });
        const accountCodeMap = new Map();
        accounts.forEach(a => accountCodeMap.set(a.code, a));
        const voucherItems = [];
        let index = 1;
        for (const line of lines) {
            if (!line.counterpartyAccount || line.counterpartyAccount.trim() === '') {
                throw new common_1.BadRequestException(`ردیف ${index}: حساب مقابل نامشخص است`);
            }
            const cAccount = accountCodeMap.get(line.counterpartyAccount);
            if (!cAccount) {
                throw new common_1.BadRequestException(`کد حساب مقابل نامعتبر است: ${line.counterpartyAccount}`);
            }
            const bal = Number(line.balance);
            const isCreditBalance = line.balanceNature === 'بستانکار';
            voucherItems.push({
                rowNumber: index++,
                accountId: line.accountId,
                detailedAccountId1: line.detailedAccountId1,
                detailedAccountId2: line.detailedAccountId2,
                detailedAccountId3: line.detailedAccountId3,
                currencyId: line.currencyId,
                debit: isCreditBalance ? bal : 0,
                credit: !isCreditBalance ? bal : 0,
                description: 'تعدیل ماهیت پایان دوره',
            });
            voucherItems.push({
                rowNumber: index++,
                accountId: cAccount.id,
                detailedAccountId1: null,
                detailedAccountId2: null,
                detailedAccountId3: null,
                currencyId: line.currencyId,
                debit: !isCreditBalance ? bal : 0,
                credit: isCreditBalance ? bal : 0,
                description: 'بستن حساب خلاف ماهیت',
            });
        }
        const voucherDto = {
            voucherTypeId: 1,
            voucherNumber: 0,
            voucherDate: voucherDate || new Date().toISOString(),
            description: 'سند تعدیل ماهیت',
            items: voucherItems
        };
        return await this.voucherService.create(voucherDto);
    }
};
exports.NatureAdjustmentService = NatureAdjustmentService;
exports.NatureAdjustmentService = NatureAdjustmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(voucher_item_entity_1.VoucherItem)),
    __param(1, (0, typeorm_1.InjectRepository)(voucher_entity_1.Voucher)),
    __param(2, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __param(3, (0, typeorm_1.InjectRepository)(detailed_account_entity_1.DetailedAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        request_context_service_1.RequestContextService,
        voucher_service_1.VoucherService,
        account_service_1.AccountService])
], NatureAdjustmentService);
//# sourceMappingURL=nature-adjustment.service.js.map
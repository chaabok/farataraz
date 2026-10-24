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
exports.ClosingTemporaryAccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const closing_temporary_account_entity_1 = require("../../domain/entities/closing-temporary-account.entity");
const closing_temporary_account_item_entity_1 = require("../../domain/entities/closing-temporary-account-item.entity");
const closing_temporary_account_selected_entity_1 = require("../../domain/entities/closing-temporary-account-selected.entity");
const account_entity_1 = require("../../domain/entities/account.entity");
const detailed_account_entity_1 = require("../../domain/entities/detailed-account.entity");
const voucher_item_entity_1 = require("../../domain/entities/voucher-item.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let ClosingTemporaryAccountService = class ClosingTemporaryAccountService {
    constructor(repo, itemRepo, selectedRepo, accountRepo, detailedAccountRepo, voucherItemRepo, idGen, reqCtx, dataSource) {
        this.repo = repo;
        this.itemRepo = itemRepo;
        this.selectedRepo = selectedRepo;
        this.accountRepo = accountRepo;
        this.detailedAccountRepo = detailedAccountRepo;
        this.voucherItemRepo = voucherItemRepo;
        this.idGen = idGen;
        this.reqCtx = reqCtx;
        this.dataSource = dataSource;
    }
    getScope() {
        let bsId = this.reqCtx.getBusinessStructureId() ?? 2;
        let compId = this.reqCtx.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        return { bsId, compId };
    }
    async getTemporaryAccountsTree(toDate) {
        const { bsId, compId } = this.getScope();
        const allAccounts = await this.accountRepo.find({
            where: [
                { businessStructureRef: bsId },
                { companyRef: compId }
            ],
            order: { code: 'ASC' }
        });
        const getGroupType = (acc) => {
            if (acc.accountType !== null && acc.accountType !== undefined && Number(acc.accountType) > 0) {
                return Number(acc.accountType);
            }
            let current = acc;
            while (current && current.parentId) {
                const parent = allAccounts.find(x => Number(x.id) === Number(current.parentId));
                if (parent) {
                    if (parent.accountType !== null && parent.accountType !== undefined && Number(parent.accountType) > 0) {
                        return Number(parent.accountType);
                    }
                    current = parent;
                }
                else {
                    break;
                }
            }
            return undefined;
        };
        const profitLossAccounts = allAccounts.filter(acc => getGroupType(acc) === 2);
        const pnlAccountIds = profitLossAccounts.map(a => Number(a.id));
        if (pnlAccountIds.length === 0) {
            return {
                id: 'root',
                name: 'حساب‌های سود و زیانی دارای مانده',
                isRoot: true,
                children: []
            };
        }
        const qb = this.voucherItemRepo.createQueryBuilder('vi')
            .leftJoin('vi.voucher', 'v')
            .where('vi.accountId IN (:...pnlAccountIds)', { pnlAccountIds });
        if (toDate && toDate.trim() !== '') {
            qb.andWhere('v.voucherDate <= :toDate', { toDate });
        }
        const items = await qb.getMany();
        const balancesMap = new Map();
        for (const item of items) {
            const accId = Number(item.accountId);
            if (!balancesMap.has(accId)) {
                balancesMap.set(accId, {
                    totalDebit: 0,
                    totalCredit: 0,
                    detailedBalances: new Map(),
                });
            }
            const entry = balancesMap.get(accId);
            const debit = Number(item.debit || 0);
            const credit = Number(item.credit || 0);
            entry.totalDebit += debit;
            entry.totalCredit += credit;
            const detIds = [
                item.detailedAccountId1, item.detailedAccountId2, item.detailedAccountId3,
                item.detailedAccountId4, item.detailedAccountId5, item.detailedAccountId6,
                item.detailedAccountId7, item.detailedAccountId8, item.detailedAccountId9,
                item.detailedAccountId10
            ].filter(Boolean).map(x => Number(x));
            for (const detId of detIds) {
                if (!entry.detailedBalances.has(detId)) {
                    entry.detailedBalances.set(detId, { debit: 0, credit: 0 });
                }
                const detEntry = entry.detailedBalances.get(detId);
                detEntry.debit += debit;
                detEntry.credit += credit;
            }
        }
        const allDetIds = new Set();
        balancesMap.forEach(e => {
            e.detailedBalances.forEach((_, detId) => allDetIds.add(detId));
        });
        let detailedAccountsList = [];
        if (allDetIds.size > 0) {
            detailedAccountsList = await this.detailedAccountRepo.createQueryBuilder('da')
                .where('da.detailedAccountId IN (:...detIds)', { detIds: Array.from(allDetIds) })
                .getMany();
        }
        const detailedMap = new Map(detailedAccountsList.map(d => [Number(d.detailedAccountId), d]));
        const treeChildren = [];
        for (const acc of profitLossAccounts) {
            const accId = Number(acc.id);
            const accBalanceInfo = balancesMap.get(accId);
            const moinDebit = accBalanceInfo?.totalDebit || 0;
            const moinCredit = accBalanceInfo?.totalCredit || 0;
            const moinBalance = moinDebit - moinCredit;
            const detailedNodes = [];
            if (accBalanceInfo && accBalanceInfo.detailedBalances.size > 0) {
                accBalanceInfo.detailedBalances.forEach((detBal, detId) => {
                    const detNet = detBal.debit - detBal.credit;
                    if (Math.abs(detNet) > 0.0001) {
                        const detObj = detailedMap.get(detId);
                        const detCode = detObj?.code || String(detId);
                        const detTitle = detObj?.title || `تفصیلی ${detCode}`;
                        detailedNodes.push({
                            id: `${acc.code}_det_${detId}`,
                            name: `${detCode} - ${detTitle} (مانده: ${detNet.toLocaleString('fa-IR')})`,
                            code: detCode,
                            title: detTitle,
                            balance: detNet
                        });
                    }
                });
            }
            if (Math.abs(moinBalance) > 0.0001 || detailedNodes.length > 0) {
                treeChildren.push({
                    id: acc.code,
                    name: `${acc.code} - ${acc.title} (مانده: ${moinBalance.toLocaleString('fa-IR')})`,
                    code: acc.code,
                    title: acc.title,
                    balance: moinBalance,
                    children: detailedNodes
                });
            }
        }
        return {
            id: 'root',
            name: 'حساب‌ها',
            isRoot: true,
            children: treeChildren
        };
    }
    async findAll() {
        const { bsId, compId } = this.getScope();
        return this.repo.find({
            where: [
                { businessStructureRef: bsId },
                { companyRef: compId }
            ],
            relations: ['items', 'selectedAccounts'],
            order: { id: 'DESC' }
        });
    }
    async findOne(id) {
        const item = await this.repo.findOne({
            where: { id },
            relations: ['items', 'selectedAccounts']
        });
        if (!item)
            throw new common_1.NotFoundException('رکورد بستن حسابهای موقت یافت نشد');
        return item;
    }
    async create(dto) {
        const { bsId, compId } = this.getScope();
        const nextId = await this.idGen.generateNextId('ClosingTemporaryAccount');
        const entity = this.repo.create({
            id: nextId,
            description: dto.description,
            toDate: dto.toDate,
            type: dto.type,
            status: dto.status || 'صادر نشده',
            businessStructureRef: bsId,
            companyRef: compId,
        });
        if (dto.items && dto.items.length > 0) {
            const itemsCount = dto.items.length;
            const startItemId = await this.idGen.generateNextIdBlock('ClosingTemporaryAccountItem', itemsCount);
            entity.items = dto.items.map((item, idx) => this.itemRepo.create({
                id: startItemId + idx,
                closingTemporaryAccountRef: nextId,
                intermediaryAccountRef: item.intermediaryAccountRef,
                intermediaryCode: item.intermediaryCode,
                percentage: item.percentage,
                detailedAccountRef1: item.detailedAccountRef1,
                detailedAccountRef2: item.detailedAccountRef2,
                detailedAccountRef3: item.detailedAccountRef3,
            }));
        }
        if (dto.selectedAccounts && dto.selectedAccounts.length > 0) {
            const selCount = dto.selectedAccounts.length;
            const startSelId = await this.idGen.generateNextIdBlock('ClosingTemporaryAccountSelected', selCount);
            entity.selectedAccounts = dto.selectedAccounts.map((sel, idx) => this.selectedRepo.create({
                id: startSelId + idx,
                closingTemporaryAccountRef: nextId,
                accountRef: sel.accountRef,
                accountCode: sel.accountCode,
                accountTitle: sel.accountTitle,
                detailedAccountRef: sel.detailedAccountRef,
            }));
        }
        return this.repo.save(entity);
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        existing.description = dto.description ?? existing.description;
        existing.toDate = dto.toDate ?? existing.toDate;
        existing.type = dto.type ?? existing.type;
        existing.status = dto.status ?? existing.status;
        if (dto.items) {
            await this.itemRepo.delete({ closingTemporaryAccountRef: id });
            const itemsCount = dto.items.length;
            if (itemsCount > 0) {
                const startItemId = await this.idGen.generateNextIdBlock('ClosingTemporaryAccountItem', itemsCount);
                existing.items = dto.items.map((item, idx) => this.itemRepo.create({
                    id: startItemId + idx,
                    closingTemporaryAccountRef: id,
                    intermediaryAccountRef: item.intermediaryAccountRef,
                    intermediaryCode: item.intermediaryCode,
                    percentage: item.percentage,
                    detailedAccountRef1: item.detailedAccountRef1,
                    detailedAccountRef2: item.detailedAccountRef2,
                    detailedAccountRef3: item.detailedAccountRef3,
                }));
            }
            else {
                existing.items = [];
            }
        }
        if (dto.selectedAccounts) {
            await this.selectedRepo.delete({ closingTemporaryAccountRef: id });
            const selCount = dto.selectedAccounts.length;
            if (selCount > 0) {
                const startSelId = await this.idGen.generateNextIdBlock('ClosingTemporaryAccountSelected', selCount);
                existing.selectedAccounts = dto.selectedAccounts.map((sel, idx) => this.selectedRepo.create({
                    id: startSelId + idx,
                    closingTemporaryAccountRef: id,
                    accountRef: sel.accountRef,
                    accountCode: sel.accountCode,
                    accountTitle: sel.accountTitle,
                    detailedAccountRef: sel.detailedAccountRef,
                }));
            }
            else {
                existing.selectedAccounts = [];
            }
        }
        return this.repo.save(existing);
    }
    async delete(id) {
        await this.repo.delete(id);
    }
};
exports.ClosingTemporaryAccountService = ClosingTemporaryAccountService;
exports.ClosingTemporaryAccountService = ClosingTemporaryAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(closing_temporary_account_entity_1.ClosingTemporaryAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(closing_temporary_account_item_entity_1.ClosingTemporaryAccountItem)),
    __param(2, (0, typeorm_1.InjectRepository)(closing_temporary_account_selected_entity_1.ClosingTemporaryAccountSelected)),
    __param(3, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __param(4, (0, typeorm_1.InjectRepository)(detailed_account_entity_1.DetailedAccount)),
    __param(5, (0, typeorm_1.InjectRepository)(voucher_item_entity_1.VoucherItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        typeorm_2.DataSource])
], ClosingTemporaryAccountService);
//# sourceMappingURL=closing-temporary-account.service.js.map
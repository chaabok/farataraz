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
exports.BankAccountRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_account_entity_1 = require("../../domain/entities/bank-account.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const base_settings_service_1 = require("../../../common/application/services/base-settings.service");
let BankAccountRepository = class BankAccountRepository {
    constructor(repository, requestContextService, idGenService, baseSettingsService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
        this.idGenService = idGenService;
        this.baseSettingsService = baseSettingsService;
    }
    async getScope() {
        const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        const compId = this.requestContextService.getCompanyId() ?? 2;
        let isShared = true;
        try {
            const rows = await this.repository.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
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
    async getBuilder() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('bankAccount')
            .leftJoinAndSelect('bankAccount.bankBranch', 'bankBranch')
            .leftJoinAndSelect('bankBranch.bank', 'bank')
            .leftJoinAndSelect('bankAccount.bankAccountType', 'bankAccountType')
            .leftJoinAndSelect('bankAccount.account', 'account')
            .leftJoinAndSelect('bankAccount.currency', 'currency');
        if (isShared) {
            qb.where('bankAccount.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('bankAccount.companyRef = :compId', { compId });
        }
        return qb;
    }
    async create(bankAccount) {
        if (!bankAccount.bankAccountId) {
            bankAccount.bankAccountId = await this.idGenService.generateNextId('BankAccounts');
        }
        const { bsId, compId } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        bankAccount.businessStructureRef = bsId;
        bankAccount.companyRef = compId;
        bankAccount.creator = userId;
        bankAccount.lastModifier = userId;
        return this.repository.save(bankAccount);
    }
    async update(bankAccountId, bankAccount) {
        const { bsId, compId, isShared } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        bankAccount.lastModifier = userId;
        const whereCondition = { bankAccountId };
        if (isShared) {
            whereCondition.businessStructureRef = bsId;
        }
        else {
            whereCondition.companyRef = compId;
        }
        await this.repository.update(whereCondition, bankAccount);
        return this.findById(bankAccountId);
    }
    async delete(bankAccountId) {
        const { bsId, compId, isShared } = await this.getScope();
        const whereCondition = { bankAccountId };
        if (isShared) {
            whereCondition.businessStructureRef = bsId;
        }
        else {
            whereCondition.companyRef = compId;
        }
        await this.repository.delete(whereCondition);
    }
    async findById(bankAccountId) {
        const qb = await this.getBuilder();
        return qb.andWhere('bankAccount.bankAccountId = :bankAccountId', { bankAccountId }).getOne();
    }
    async findAll(options) {
        const qb = await this.getBuilder();
        if (options) {
            (0, typeorm_query_builder_1.applyDataGridParams)(qb, options, 'bankAccount');
            if (options.excludeId) {
                qb.andWhere('bankAccount.bankAccountId != :excludeId', { excludeId: options.excludeId });
            }
            if (options.isActive !== undefined) {
                qb.andWhere('bankAccount.isActive = :isActive', { isActive: options.isActive === 'true' || options.isActive === true });
            }
        }
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
};
exports.BankAccountRepository = BankAccountRepository;
exports.BankAccountRepository = BankAccountRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_account_entity_1.BankAccount)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => base_settings_service_1.BaseSettingsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService,
        base_settings_service_1.BaseSettingsService])
], BankAccountRepository);
//# sourceMappingURL=bank-account.repository.js.map
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
exports.CashService = void 0;
const common_1 = require("@nestjs/common");
const cash_repository_interface_1 = require("../../domain/repositories/cash.repository.interface");
const cashier_repository_interface_1 = require("../../domain/repositories/cashier.repository.interface");
const detailed_account_service_1 = require("../../../accounting/application/services/detailed-account.service");
const detailed_accounts_numbering_service_1 = require("../../../common/application/services/detailed-accounts-numbering.service");
const detailed_type_service_1 = require("../../../accounting/application/services/detailed-type.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let CashService = class CashService {
    constructor(cashRepository, cashierRepository, detailedAccountService, detailedAccountsNumberingService, detailedTypeService, requestContextService, idGenService) {
        this.cashRepository = cashRepository;
        this.cashierRepository = cashierRepository;
        this.detailedAccountService = detailedAccountService;
        this.detailedAccountsNumberingService = detailedAccountsNumberingService;
        this.detailedTypeService = detailedTypeService;
        this.requestContextService = requestContextService;
        this.idGenService = idGenService;
    }
    async create(createDto) {
        let detailedAccountId = null;
        const detailedTypes = await this.detailedTypeService.findAll();
        const typeCash = detailedTypes.find(t => t.code === '2');
        if (typeCash) {
            const newDa = await this.detailedAccountService.create({
                code: createDto.detailedAccountCode,
                title: createDto.title,
                title_en: createDto.title_en,
                detailedTypesId: typeCash.detailedTypesId,
                description: createDto.description,
                isActive: createDto.isActive ?? true,
            });
            detailedAccountId = newDa.detailedAccountId;
        }
        const bsId = 1;
        const data = {
            code: createDto.code,
            title: createDto.title,
            title_en: createDto.title_en,
            cashTypeId: createDto.cashTypeId || 1,
            currencyId: createDto.currencyId,
            initialBalance: createDto.initialBalance || 0,
            openingDate: createDto.openingDate,
            isActive: createDto.isActive ?? true,
            description: createDto.description,
            detailedAccountId: detailedAccountId,
        };
        const newCash = await this.cashRepository.create(data);
        if (createDto.cashiers && createDto.cashiers.length > 0) {
            for (const userId of createDto.cashiers) {
                await this.cashierRepository.create({
                    cashId: newCash.cashId,
                    userId: userId,
                });
            }
        }
        return this.findOne(newCash.cashId);
    }
    async update(id, updateDto) {
        const existing = await this.findOne(id);
        if (existing.detailedAccountId && existing.detailedAccount) {
            await this.detailedAccountService.update(existing.detailedAccountId, {
                code: updateDto.detailedAccountCode,
                title: updateDto.title,
                title_en: updateDto.title_en,
                detailedTypesId: existing.detailedAccount.detailedTypesId,
                description: updateDto.description,
                isActive: updateDto.isActive ?? true,
            });
        }
        const data = {
            code: updateDto.code,
            title: updateDto.title,
            title_en: updateDto.title_en,
            cashTypeId: updateDto.cashTypeId,
            currencyId: updateDto.currencyId,
            initialBalance: updateDto.initialBalance,
            openingDate: updateDto.openingDate,
            isActive: updateDto.isActive,
            description: updateDto.description,
        };
        await this.cashRepository.update(id, data);
        if (updateDto.cashiers !== undefined) {
            const existingCashiers = await this.cashierRepository.findByCashId(id);
            for (const ec of existingCashiers) {
                if (!updateDto.cashiers.includes(ec.userId)) {
                    await this.cashierRepository.delete(ec.cashierId);
                }
            }
            const existingUserIds = existingCashiers.map(ec => ec.userId);
            for (const userId of updateDto.cashiers) {
                if (!existingUserIds.includes(userId)) {
                    await this.cashierRepository.create({
                        cashId: id,
                        userId: userId,
                    });
                }
            }
        }
        return this.findOne(id);
    }
    async findAll() {
        return this.cashRepository.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.cashRepository.findAdvanced(params);
        return { items, total };
    }
    async findOne(id) {
        const item = await this.cashRepository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`Cash with ID ${id} not found`);
        }
        return item;
    }
    async remove(id) {
        const existing = await this.findOne(id);
        const existingCashiers = await this.cashierRepository.findByCashId(id);
        for (const ec of existingCashiers) {
            await this.cashierRepository.delete(ec.cashierId);
        }
        const detailedAccountId = existing.detailedAccountId;
        await this.cashRepository.delete(id);
        if (detailedAccountId) {
            try {
                await this.detailedAccountService.remove(detailedAccountId);
            }
            catch (e) {
                console.error('Failed to delete detailed account associated with cash:', e);
            }
        }
    }
    async checkDuplicate(field, value, excludeId) {
        return this.cashRepository.checkDuplicate(field, value, excludeId);
    }
};
exports.CashService = CashService;
exports.CashService = CashService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cash_repository_interface_1.ICashRepositoryToken)),
    __param(1, (0, common_1.Inject)(cashier_repository_interface_1.ICashierRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, detailed_account_service_1.DetailedAccountService,
        detailed_accounts_numbering_service_1.DetailedAccountsNumberingService,
        detailed_type_service_1.DetailedTypeService,
        request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService])
], CashService);
//# sourceMappingURL=cash.service.js.map
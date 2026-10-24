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
exports.BankAccountService = void 0;
const common_1 = require("@nestjs/common");
const bank_account_repository_interface_1 = require("../../domain/repositories/bank-account.repository.interface");
const bank_account_entity_1 = require("../../domain/entities/bank-account.entity");
const activity_log_service_1 = require("../../../../core/services/activity-log.service");
const detailed_type_service_1 = require("../../../accounting/application/services/detailed-type.service");
const detailed_accounts_numbering_service_1 = require("../../../common/application/services/detailed-accounts-numbering.service");
const detailed_account_service_1 = require("../../../accounting/application/services/detailed-account.service");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
let BankAccountService = class BankAccountService {
    constructor(bankAccountRepository, activityLogService, detailedTypeService, detailedAccountsNumberingService, detailedAccountService) {
        this.bankAccountRepository = bankAccountRepository;
        this.activityLogService = activityLogService;
        this.detailedTypeService = detailedTypeService;
        this.detailedAccountsNumberingService = detailedAccountsNumberingService;
        this.detailedAccountService = detailedAccountService;
    }
    async create(createDto) {
        const bankAccount = new bank_account_entity_1.BankAccount();
        Object.assign(bankAccount, createDto);
        if (typeof bankAccount.latinTitle === 'string' && (!bankAccount.latinTitle.trim() || bankAccount.latinTitle === 'EMPTY_STRING')) {
            bankAccount.latinTitle = null;
        }
        if (typeof bankAccount.shabaNumber === 'string' && (!bankAccount.shabaNumber.trim() || bankAccount.shabaNumber === 'EMPTY_STRING')) {
            bankAccount.shabaNumber = null;
        }
        if (typeof bankAccount.accountHolderName === 'string' && (!bankAccount.accountHolderName.trim() || bankAccount.accountHolderName === 'EMPTY_STRING')) {
            bankAccount.accountHolderName = null;
        }
        if (createDto.openingDate !== undefined) {
            if (typeof createDto.openingDate === 'string' && createDto.openingDate.includes('/')) {
                bankAccount.openingDate = (0, moment_jalaali_1.default)(createDto.openingDate, 'jYYYY/jMM/jDD').toDate();
            }
            else if (createDto.openingDate) {
                bankAccount.openingDate = new Date(createDto.openingDate);
            }
        }
        const types = await this.detailedTypeService.findAll();
        const bankDetailedType = types.find(t => t.code === '1' || t.title === 'حساب بانکی');
        if (bankDetailedType) {
            let codeToUse = bankAccount.detailedCode ? String(bankAccount.detailedCode) : null;
            if (!codeToUse) {
                codeToUse = await this.detailedAccountsNumberingService.getNextCode(bankDetailedType.detailedTypesId);
                bankAccount.detailedCode = parseInt(codeToUse, 10);
            }
            await this.syncDetailedAccount(codeToUse, bankAccount.title || `حساب بانکی ${bankAccount.accountNumber}`, bankAccount.latinTitle, bankDetailedType.detailedTypesId, bankAccount.isActive !== undefined ? bankAccount.isActive : true);
        }
        const created = await this.bankAccountRepository.create(bankAccount);
        this.activityLogService.logActionAsync({
            action: 'Create',
            entityName: 'Rap.BankAccounts',
            entityId: created.bankAccountId ? created.bankAccountId.toString() : '',
            newValues: created
        });
        return created;
    }
    async update(id, updateDto) {
        const data = { ...updateDto };
        if (typeof data.latinTitle === 'string' && (!data.latinTitle.trim() || data.latinTitle === 'EMPTY_STRING')) {
            data.latinTitle = null;
        }
        if (typeof data.shabaNumber === 'string' && (!data.shabaNumber.trim() || data.shabaNumber === 'EMPTY_STRING')) {
            data.shabaNumber = null;
        }
        if (typeof data.accountHolderName === 'string' && (!data.accountHolderName.trim() || data.accountHolderName === 'EMPTY_STRING')) {
            data.accountHolderName = null;
        }
        if (updateDto.openingDate !== undefined) {
            if (typeof updateDto.openingDate === 'string' && updateDto.openingDate.includes('/')) {
                data.openingDate = (0, moment_jalaali_1.default)(updateDto.openingDate, 'jYYYY/jMM/jDD').toDate();
            }
            else if (updateDto.openingDate) {
                data.openingDate = new Date(updateDto.openingDate);
            }
        }
        const updated = await this.bankAccountRepository.update(id, data);
        if (updated) {
            const types = await this.detailedTypeService.findAll();
            const bankDetailedType = types.find(t => t.code === '1' || t.title === 'حساب بانکی');
            if (bankDetailedType && updated.detailedCode) {
                await this.syncDetailedAccount(String(updated.detailedCode), updated.title, updated.latinTitle, bankDetailedType.detailedTypesId, updated.isActive !== undefined ? updated.isActive : true);
            }
        }
        this.activityLogService.logActionAsync({
            action: 'Update',
            entityName: 'Rap.BankAccounts',
            entityId: id.toString(),
            newValues: updated
        });
        return updated;
    }
    async delete(id) {
        const existing = await this.bankAccountRepository.findById(id);
        await this.bankAccountRepository.delete(id);
        if (existing && existing.detailedCode) {
            try {
                const types = await this.detailedTypeService.findAll();
                const bankDetailedType = types.find(t => t.code === '1' || t.title === 'حساب بانکی');
                if (bankDetailedType) {
                    const allDAs = await this.detailedAccountService.findAll();
                    const existingDA = allDAs.find(da => (da.detailedTypesId === bankDetailedType.detailedTypesId || da.detailedType?.code === '1') &&
                        String(da.code) === String(existing.detailedCode));
                    if (existingDA) {
                        await this.detailedAccountService.remove(existingDA.detailedAccountId);
                    }
                }
            }
            catch (e) {
                console.error('Failed to delete associated detailed account for bank account:', e);
            }
        }
        this.activityLogService.logActionAsync({
            action: 'Delete',
            entityName: 'Rap.BankAccounts',
            entityId: id.toString()
        });
    }
    async syncDetailedAccount(code, title, titleEn, detailedTypesId, isActive) {
        try {
            const allDAs = await this.detailedAccountService.findAll();
            const existingDA = allDAs.find(da => (da.detailedTypesId === detailedTypesId || da.detailedType?.code === '1') &&
                String(da.code) === String(code));
            if (!existingDA) {
                await this.detailedAccountService.create({
                    code: code,
                    title: title,
                    title_en: titleEn || undefined,
                    detailedTypesId: detailedTypesId,
                    isActive: isActive,
                });
            }
            else {
                await this.detailedAccountService.update(existingDA.detailedAccountId, {
                    title: title,
                    title_en: titleEn || undefined,
                    isActive: isActive,
                });
            }
        }
        catch (err) {
            console.error('Failed to sync detailed account for bank account:', err);
        }
    }
    async findById(id) {
        return this.bankAccountRepository.findById(id);
    }
    async findAll(options) {
        return this.bankAccountRepository.findAll(options);
    }
};
exports.BankAccountService = BankAccountService;
exports.BankAccountService = BankAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(bank_account_repository_interface_1.IBankAccountRepositoryToken)),
    __metadata("design:paramtypes", [Object, activity_log_service_1.ActivityLogService,
        detailed_type_service_1.DetailedTypeService,
        detailed_accounts_numbering_service_1.DetailedAccountsNumberingService,
        detailed_account_service_1.DetailedAccountService])
], BankAccountService);
//# sourceMappingURL=bank-account.service.js.map
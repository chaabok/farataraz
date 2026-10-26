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
exports.ReconcileBankStatementService = void 0;
const common_1 = require("@nestjs/common");
const reconcile_bank_statement_repository_interface_1 = require("../../domain/repositories/reconcile-bank-statement.repository.interface");
const reconcile_bank_statement_entity_1 = require("../../domain/entities/reconcile-bank-statement.entity");
const reconcile_bank_statement_item_entity_1 = require("../../domain/entities/reconcile-bank-statement-item.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const base_settings_service_1 = require("../../../common/application/services/base-settings.service");
const fiscal_year_service_1 = require("../../../common/application/services/fiscal-year.service");
const bank_account_service_1 = require("./bank-account.service");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
const moment_1 = __importDefault(require("moment"));
let ReconcileBankStatementService = class ReconcileBankStatementService {
    constructor(repository, idGenerationService, requestContext, baseSettingsService, fiscalYearService, bankAccountService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContext = requestContext;
        this.baseSettingsService = baseSettingsService;
        this.fiscalYearService = fiscalYearService;
        this.bankAccountService = bankAccountService;
    }
    async findAll() {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        const fiscalYearId = this.requestContext.getFiscalYearId();
        return this.repository.findAll(businessStructureId, companyId, fiscalYearId);
    }
    async findOne(id) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        const fiscalYearId = this.requestContext.getFiscalYearId();
        const result = await this.repository.findById(id, businessStructureId, companyId, fiscalYearId);
        if (!result)
            throw new common_1.NotFoundException('ReconcileBankStatement not found');
        return result;
    }
    async getSuggestedDates(bankAccountRef) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        const latest = await this.repository.findLatestByBankAccount(bankAccountRef, businessStructureId, companyId);
        if (latest) {
            return {
                fromDate: latest.Date,
                previousBalance: typeof latest.balance === 'string' ? parseFloat(latest.balance) : (latest.balance || 0),
            };
        }
        let settings = await this.baseSettingsService.getSettingsByTab(6, companyId, undefined, undefined);
        let establishmentYearRef = settings['establishmentYearRef'];
        if (!establishmentYearRef && businessStructureId !== companyId) {
            settings = await this.baseSettingsService.getSettingsByTab(6, businessStructureId, undefined, undefined);
            establishmentYearRef = settings['establishmentYearRef'];
        }
        if (!establishmentYearRef && companyId !== 1 && businessStructureId !== 1) {
            settings = await this.baseSettingsService.getSettingsByTab(6, 1, undefined, undefined);
            establishmentYearRef = settings['establishmentYearRef'];
        }
        if (establishmentYearRef) {
            const yearStr = String(establishmentYearRef).trim();
            let fiscalYear = null;
            try {
                fiscalYear = await this.fiscalYearService.findOne(parseInt(yearStr, 10));
            }
            catch (e) {
                fiscalYear = await this.fiscalYearService.findByTitle(yearStr);
            }
            if (fiscalYear && fiscalYear.startDate) {
                const suggestedDate = (0, moment_1.default)(fiscalYear.startDate).subtract(1, 'day').toISOString();
                const bankAccount = await this.bankAccountService.findById(bankAccountRef);
                return {
                    fromDate: suggestedDate,
                    previousBalance: typeof bankAccount?.initialBalance === 'string' ? parseFloat(bankAccount.initialBalance) : (bankAccount?.initialBalance || 0),
                };
            }
        }
        return {
            fromDate: '',
            previousBalance: 0,
        };
    }
    async getNextNumbers(jalaliDateStr) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        let dateStr = jalaliDateStr;
        if (!dateStr) {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        return {
            documentNumber: docRes.nextValue,
            isDocumentNumberAuto: docRes.numberingMethod === '2',
            error: docRes.error || null,
        };
    }
    async create(dto) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        const fiscalYearId = this.requestContext.getFiscalYearId();
        let dateStr = '';
        if (dto.Date) {
            dateStr = (0, moment_jalaali_1.default)(dto.Date).format('jYYYY/jMM/jDD');
        }
        else {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        if (docRes.error) {
            throw new Error(docRes.error);
        }
        if (docRes.numberingMethod === '2' || !dto.Number) {
            dto.Number = docRes.nextValue;
        }
        const id = await this.idGenerationService.generateNextId('ReconcileBankStatement');
        const entity = new reconcile_bank_statement_entity_1.ReconcileBankStatement();
        Object.assign(entity, dto);
        if (dto.items) {
            const headerDateStr = dto.Date ? (0, moment_1.default)(dto.Date).format('YYYY-MM-DD') : '';
            dto.items.forEach((item, index) => {
                const rowNum = index + 1;
                if (!item.documentDate) {
                    throw new Error(`ورود تاریخ سند در ردیف ${rowNum} اجباری است.`);
                }
                if (headerDateStr) {
                    const itemDateStr = (0, moment_1.default)(item.documentDate).format('YYYY-MM-DD');
                    if (itemDateStr > headerDateStr) {
                        throw new Error(`تاریخ سند در ردیف ${rowNum} نباید از تاریخ صورتحساب بزرگتر باشد.`);
                    }
                }
                const d = item.debit || 0;
                const c = item.credit || 0;
                if (d <= 0 && c <= 0) {
                    throw new Error(`ورود یکی از مقادیر بدهکار یا بستانکار در ردیف ${rowNum} اجباری است.`);
                }
                if (d > 0 && c > 0) {
                    throw new Error('هر ردیف در صورتحساب بانکی نمی‌تواند همزمان دارای مبلغ بدهکار و بستانکار باشد.');
                }
            });
        }
        entity.ReconcileBankStatementID = id;
        entity.businessStructureRef = businessStructureId;
        entity.companyRef = companyId;
        entity.fiscalYearRef = fiscalYearId;
        if (dto.items && dto.items.length > 0) {
            entity.items = await Promise.all(dto.items.map(async (itemDto) => {
                const item = new reconcile_bank_statement_item_entity_1.ReconcileBankStatementItem();
                Object.assign(item, itemDto);
                item.ReconcileBankStatementItemID = await this.idGenerationService.generateNextId('ReconcileBankStatementItem');
                item.businessStructureRef = businessStructureId;
                item.companyRef = companyId;
                item.ReconcileBankStatementRef = id;
                return item;
            }));
        }
        else {
            entity.items = [];
        }
        return this.repository.create(entity);
    }
    async update(id, dto) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        const fiscalYearId = this.requestContext.getFiscalYearId();
        const existing = await this.findOne(id);
        Object.assign(existing, dto);
        existing.fiscalYearRef = fiscalYearId;
        if (dto.items) {
            const headerDateStr = dto.Date ? (0, moment_1.default)(dto.Date).format('YYYY-MM-DD') : '';
            dto.items.forEach((item, index) => {
                const rowNum = index + 1;
                if (!item.documentDate) {
                    throw new Error(`ورود تاریخ سند در ردیف ${rowNum} اجباری است.`);
                }
                if (headerDateStr) {
                    const itemDateStr = (0, moment_1.default)(item.documentDate).format('YYYY-MM-DD');
                    if (itemDateStr > headerDateStr) {
                        throw new Error(`تاریخ سند در ردیف ${rowNum} نباید از تاریخ صورتحساب بزرگتر باشد.`);
                    }
                }
                const d = item.debit || 0;
                const c = item.credit || 0;
                if (d <= 0 && c <= 0) {
                    throw new Error(`ورود یکی از مقادیر بدهکار یا بستانکار در ردیف ${rowNum} اجباری است.`);
                }
                if (d > 0 && c > 0) {
                    throw new Error('هر ردیف در صورتحساب بانکی نمی‌تواند همزمان دارای مبلغ بدهکار و بستانکار باشد.');
                }
            });
        }
        if (dto.items) {
            const itemsMap = new Map((existing.items || []).map(i => [i.ReconcileBankStatementItemID, i]));
            existing.items = await Promise.all(dto.items.map(async (itemDto) => {
                let item = itemDto.ReconcileBankStatementItemID ? itemsMap.get(itemDto.ReconcileBankStatementItemID) : null;
                if (!item) {
                    item = new reconcile_bank_statement_item_entity_1.ReconcileBankStatementItem();
                    item.ReconcileBankStatementItemID = await this.idGenerationService.generateNextId('ReconcileBankStatementItem');
                    item.businessStructureRef = businessStructureId;
                    item.companyRef = companyId;
                    item.ReconcileBankStatementRef = id;
                }
                Object.assign(item, itemDto);
                return item;
            }));
        }
        return this.repository.update(existing);
    }
    async remove(id) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        await this.findOne(id);
        await this.repository.delete(id, businessStructureId, companyId);
    }
};
exports.ReconcileBankStatementService = ReconcileBankStatementService;
exports.ReconcileBankStatementService = ReconcileBankStatementService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(reconcile_bank_statement_repository_interface_1.IReconcileBankStatementRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        base_settings_service_1.BaseSettingsService,
        fiscal_year_service_1.FiscalYearService,
        bank_account_service_1.BankAccountService])
], ReconcileBankStatementService);
//# sourceMappingURL=reconcile-bank-statement.service.js.map
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
exports.RecieptAndPaymentAccountingSettingService = void 0;
const common_1 = require("@nestjs/common");
const reciept_and_payment_accounting_setting_repository_interface_1 = require("../../domain/repositories/reciept-and-payment-accounting-setting.repository.interface");
const reciept_and_payment_accounting_setting_entity_1 = require("../../domain/entities/reciept-and-payment-accounting-setting.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_1 = require("typeorm");
let RecieptAndPaymentAccountingSettingService = class RecieptAndPaymentAccountingSettingService {
    constructor(repository, idGenerationService, requestContextService, dataSource) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
        this.dataSource = dataSource;
    }
    async isBasicInfoShared(businessStructureId) {
        const q = `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`;
        const rows = await this.dataSource.query(q, [businessStructureId]);
        if (rows && rows.length > 0) {
            if (rows.some((r) => {
                const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                return val === false || val === 0 || val === 'false' || val === null;
            })) {
                return false;
            }
            return true;
        }
        return false;
    }
    async getNextNumber() {
        const bsRef = this.requestContextService.getBusinessStructureId() || 2;
        const compRef = this.requestContextService.getCompanyId() || 2;
        const res = await this.repository.calculateNextCode(bsRef, compRef);
        return {
            documentNumber: res.nextValue,
            isDocumentNumberAuto: res.numberingMethod === '2',
            error: res.error,
        };
    }
    async create(createDto) {
        const setting = new reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting();
        Object.assign(setting, createDto);
        const bsRef = this.requestContextService.getBusinessStructureId() || 2;
        const compRef = this.requestContextService.getCompanyId() || 2;
        const isShared = await this.isBasicInfoShared(bsRef);
        let codeToSave = setting.code;
        const docRes = await this.repository.calculateNextCode(bsRef, compRef);
        if (docRes.numberingMethod === '2' || !codeToSave) {
            if (docRes.error) {
                throw new Error(docRes.error);
            }
            codeToSave = docRes.nextValue;
        }
        setting.code = codeToSave;
        if (setting.code) {
            const existing = await this.repository.findByCode(setting.code);
            if (existing) {
                throw new Error("RecieptAndPaymentAccountingSetting with this code already exists in the current scope.");
            }
        }
        setting.recieptAndPaymentAccountingSettingId = await this.idGenerationService.generateNextId('RecieptAndPaymentAccountingSetting');
        setting.businessStructureRef = bsRef;
        setting.companyRef = compRef;
        return await this.repository.create(setting);
    }
    async update(id, updateDto) {
        const setting = await this.repository.findById(id);
        if (!setting) {
            throw new common_1.NotFoundException(`RecieptAndPaymentAccountingSetting with ID ${id} not found`);
        }
        Object.assign(setting, updateDto);
        return await this.repository.update(setting);
    }
    async delete(id) {
        const setting = await this.repository.findById(id);
        if (!setting) {
            throw new common_1.NotFoundException(`RecieptAndPaymentAccountingSetting with ID ${id} not found`);
        }
        await this.repository.delete(id);
    }
    async findById(id) {
        const setting = await this.repository.findById(id);
        if (!setting) {
            throw new common_1.NotFoundException(`RecieptAndPaymentAccountingSetting with ID ${id} not found`);
        }
        return setting;
    }
    async findAll(options) {
        return await this.repository.findAll(options);
    }
};
exports.RecieptAndPaymentAccountingSettingService = RecieptAndPaymentAccountingSettingService;
exports.RecieptAndPaymentAccountingSettingService = RecieptAndPaymentAccountingSettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(reciept_and_payment_accounting_setting_repository_interface_1.IRecieptAndPaymentAccountingSettingRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        typeorm_1.DataSource])
], RecieptAndPaymentAccountingSettingService);
//# sourceMappingURL=reciept-and-payment-accounting-setting.service.js.map
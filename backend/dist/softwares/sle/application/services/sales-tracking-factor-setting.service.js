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
exports.SalesTrackingFactorSettingService = void 0;
const common_1 = require("@nestjs/common");
const sales_tracking_factor_setting_repository_interface_1 = require("../../domain/repositories/sales-tracking-factor-setting.repository.interface");
const sales_tracking_factor_setting_entity_1 = require("../../domain/entities/sales-tracking-factor-setting.entity");
const sales_document_type_enum_1 = require("../../domain/entities/sales-document-type.enum");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let SalesTrackingFactorSettingService = class SalesTrackingFactorSettingService {
    constructor(repository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        return { bsId, compId };
    }
    async getSettings() {
        const { bsId } = await this.getScope();
        const all = await this.repository.findAll();
        const rows = all.filter((x) => !x.BusinessStructureRef || Number(x.BusinessStructureRef) === bsId);
        return sales_document_type_enum_1.SALES_DOCUMENT_TYPE_LABELS.map((t) => {
            const row = rows.find((r) => Number(r.SalesDocumentType) === t.value);
            return {
                SalesDocumentType: t.value,
                SalesDocumentTypeName: t.label,
                ShowTrackingFactor: row ? !!row.ShowTrackingFactor : false,
            };
        });
    }
    async upsertMany(settings) {
        const { bsId, compId } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        if (!Array.isArray(settings)) {
            throw new common_1.BadRequestException('لیست تنظیمات ارسال نشده است.');
        }
        const unique = new Map();
        for (const item of settings) {
            const type = Number(item?.SalesDocumentType);
            if (!(0, sales_document_type_enum_1.isValidSalesDocumentType)(type)) {
                throw new common_1.BadRequestException(`نوع سند فروش ${item?.SalesDocumentType} نامعتبر است.`);
            }
            unique.set(type, !!item.ShowTrackingFactor);
        }
        for (const [type, show] of unique.entries()) {
            const existing = await this.repository.findByType(type, bsId);
            if (existing) {
                await this.repository.update(existing.SalesTrackingFactorSettingID, {
                    ShowTrackingFactor: show,
                    LastModifierRef: userId,
                    LastModificationDate: new Date(),
                });
            }
            else {
                const id = await this.idGenerationService.generateNextId('SalesTrackingFactorSettings');
                const entity = this.repository.manager.create(sales_tracking_factor_setting_entity_1.SalesTrackingFactorSetting, {
                    SalesTrackingFactorSettingID: id,
                    SalesDocumentType: type,
                    ShowTrackingFactor: show,
                    CreatorRef: userId,
                    CreationDate: new Date(),
                    LastModifierRef: userId,
                    LastModificationDate: new Date(),
                    CompanyRef: compId,
                    BusinessStructureRef: bsId,
                });
                await this.repository.create(entity);
            }
        }
        return this.getSettings();
    }
};
exports.SalesTrackingFactorSettingService = SalesTrackingFactorSettingService;
exports.SalesTrackingFactorSettingService = SalesTrackingFactorSettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(sales_tracking_factor_setting_repository_interface_1.ISalesTrackingFactorSettingRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesTrackingFactorSettingService);
//# sourceMappingURL=sales-tracking-factor-setting.service.js.map
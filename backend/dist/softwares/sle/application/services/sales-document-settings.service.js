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
exports.SalesDocumentSettingsService = void 0;
const common_1 = require("@nestjs/common");
const sales_document_settings_repository_interface_1 = require("../../domain/repositories/sales-document-settings.repository.interface");
const sales_document_settings_entity_1 = require("../../domain/entities/sales-document-settings.entity");
const create_sales_document_settings_dto_1 = require("../dtos/create-sales-document-settings.dto");
const sales_document_type_enum_1 = require("../../domain/entities/sales-document-type.enum");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let SalesDocumentSettingsService = class SalesDocumentSettingsService {
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
    async findAll() {
        const { bsId } = await this.getScope();
        const all = await this.repository.findAll();
        return all.filter((x) => !x.BusinessStructureRef || Number(x.BusinessStructureRef) === bsId);
    }
    async findById(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`SalesDocumentSettings with ID ${id} not found`);
        }
        return item;
    }
    async findByType(type) {
        const { bsId } = await this.getScope();
        if (!(0, sales_document_type_enum_1.isValidSalesDocumentType)(type)) {
            throw new common_1.BadRequestException('نوع سند فروش نامعتبر است.');
        }
        const item = await this.repository.findByType(Number(type), bsId);
        if (!item) {
            return this.repository.findByType(Number(type));
        }
        return item;
    }
    getDocumentTypes() {
        return sales_document_type_enum_1.SALES_DOCUMENT_TYPE_LABELS.map((x) => ({ id: x.value, title: x.label }));
    }
    async upsert(dto) {
        (0, create_sales_document_settings_dto_1.assertValidSalesDocumentType)(dto);
        const { bsId, compId } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        const type = Number(dto.SalesDocumentType);
        let baseDocumentTypes = null;
        if (dto.HasBaseDocument && dto.BaseDocumentTypes) {
            const ids = String(dto.BaseDocumentTypes)
                .split(',')
                .map((x) => Number(x.trim()))
                .filter((x) => Number.isFinite(x) && (0, sales_document_type_enum_1.isValidSalesDocumentType)(x) && x !== type);
            baseDocumentTypes = ids.length > 0 ? Array.from(new Set(ids)).join(',') : null;
        }
        const defaultWarehouseRef = dto.ShowWarehouse ? dto.DefaultWarehouseRef ?? null : null;
        const defaultSalesCenterRef = dto.ShowSalesCenter ? dto.DefaultSalesCenterRef ?? null : null;
        const defaultSalesTypeRef = dto.ShowSalesType ? dto.DefaultSalesTypeRef ?? null : null;
        const defaultDeliveryLocationRef = dto.ShowDeliveryLocations ? dto.DefaultDeliveryLocationRef ?? null : null;
        const existing = await this.repository.findByType(type, bsId);
        if (existing) {
            const updateData = {
                HasBaseDocument: dto.HasBaseDocument ?? false,
                BaseDocumentTypes: baseDocumentTypes,
                ShowWarehouse: dto.ShowWarehouse ?? false,
                DefaultWarehouseRef: defaultWarehouseRef,
                ShowSalesCenter: dto.ShowSalesCenter ?? false,
                DefaultSalesCenterRef: defaultSalesCenterRef,
                ShowSalesType: dto.ShowSalesType ?? false,
                DefaultSalesTypeRef: defaultSalesTypeRef,
                ShowDeliveryLocations: dto.ShowDeliveryLocations ?? false,
                DefaultDeliveryLocationRef: defaultDeliveryLocationRef,
                HasAccountingDocument: dto.HasAccountingDocument ?? false,
                ShowPurchaseSalesParameters: dto.ShowPurchaseSalesParameters ?? false,
                IsActive: dto.IsActive ?? true,
                LastModifierRef: userId,
                LastModificationDate: new Date(),
            };
            return this.repository.update(existing.SalesDocumentSettingsID, updateData);
        }
        const id = dto.SalesDocumentSettingsID ||
            (await this.idGenerationService.generateNextId('SalesDocumentSettings'));
        const entity = this.repository.manager.create(sales_document_settings_entity_1.SalesDocumentSettings, {
            SalesDocumentSettingsID: id,
            SalesDocumentType: type,
            HasBaseDocument: dto.HasBaseDocument ?? false,
            BaseDocumentTypes: baseDocumentTypes,
            ShowWarehouse: dto.ShowWarehouse ?? false,
            DefaultWarehouseRef: defaultWarehouseRef,
            ShowSalesCenter: dto.ShowSalesCenter ?? false,
            DefaultSalesCenterRef: defaultSalesCenterRef,
            ShowSalesType: dto.ShowSalesType ?? false,
            DefaultSalesTypeRef: defaultSalesTypeRef,
            ShowDeliveryLocations: dto.ShowDeliveryLocations ?? false,
            DefaultDeliveryLocationRef: defaultDeliveryLocationRef,
            HasAccountingDocument: dto.HasAccountingDocument ?? false,
            ShowPurchaseSalesParameters: dto.ShowPurchaseSalesParameters ?? false,
            IsActive: dto.IsActive ?? true,
            CreatorRef: userId,
            CreationDate: new Date(),
            LastModifierRef: userId,
            LastModificationDate: new Date(),
            CompanyRef: compId,
            BusinessStructureRef: bsId,
        });
        return this.repository.create(entity);
    }
    async remove(id) {
        await this.findById(id);
        await this.repository.delete(id);
    }
};
exports.SalesDocumentSettingsService = SalesDocumentSettingsService;
exports.SalesDocumentSettingsService = SalesDocumentSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(sales_document_settings_repository_interface_1.ISalesDocumentSettingsRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesDocumentSettingsService);
//# sourceMappingURL=sales-document-settings.service.js.map
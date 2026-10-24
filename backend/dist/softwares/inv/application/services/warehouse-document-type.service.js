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
exports.WarehouseDocumentTypeService = void 0;
const common_1 = require("@nestjs/common");
const warehouse_document_type_repository_interface_1 = require("../../domain/repositories/warehouse-document-type.repository.interface");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let WarehouseDocumentTypeService = class WarehouseDocumentTypeService {
    constructor(repository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async findAll(query) {
        let data = await this.repository.findAll();
        if (query && (query.nature !== undefined || query.WarehouseDocumentNature !== undefined)) {
            const targetNature = Number(query.nature ?? query.WarehouseDocumentNature);
            if (!isNaN(targetNature)) {
                data = data.filter((item) => Number(item.WarehouseDocumentNature) === targetNature);
            }
        }
        return { data, total: data.length, success: true };
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity)
            throw new common_1.NotFoundException('نوع سند انبار یافت نشد');
        return entity;
    }
    async getNextNumber() {
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const res = await this.repository.calculateNextCode(bsId, companyId);
        return {
            documentNumber: res.nextValue,
            isDocumentNumberAuto: res.numberingMethod === '2',
            error: res.error,
        };
    }
    async checkDuplicate(field, value, excludeId) {
        return this.repository.checkDuplicate(field, value, excludeId);
    }
    async validateFields(dto, isCreate = false) {
        if (isCreate || dto.WarehouseDocumentTypeTitle !== undefined) {
            if (!dto.WarehouseDocumentTypeTitle || !dto.WarehouseDocumentTypeTitle.trim()) {
                throw new common_1.BadRequestException('عنوان نوع سند انبار اجباری است');
            }
        }
        if (isCreate || dto.WarehouseName !== undefined) {
            if (!dto.WarehouseName || !dto.WarehouseName.trim()) {
                throw new common_1.BadRequestException('نام انبار اجباری است');
            }
        }
        if (isCreate || dto.DisplayableItemNatures !== undefined) {
            if (!dto.DisplayableItemNatures || !Array.isArray(dto.DisplayableItemNatures) || dto.DisplayableItemNatures.length === 0) {
                throw new common_1.BadRequestException('ماهیت کالاهای قابل نمایش اجباری است');
            }
        }
    }
    async validateDuplicates(dto, excludeId) {
        if (dto.WarehouseDocumentTypeCode !== undefined) {
            const isDuplicateCode = await this.checkDuplicate('WarehouseDocumentTypeCode', dto.WarehouseDocumentTypeCode, excludeId);
            if (isDuplicateCode) {
                throw new common_1.BadRequestException('کد نوع سند انبار تکراری است');
            }
        }
        if (dto.WarehouseDocumentTypeTitle !== undefined) {
            const isDuplicateTitle = await this.checkDuplicate('WarehouseDocumentTypeTitle', dto.WarehouseDocumentTypeTitle, excludeId);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('عنوان نوع سند انبار تکراری است');
            }
        }
    }
    async create(createDto) {
        const userId = this.requestContextService.getUserId();
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        await this.validateFields(createDto, true);
        let codeToSave = createDto.WarehouseDocumentTypeCode;
        if (!codeToSave) {
            const docRes = await this.repository.calculateNextCode(bsId, companyId);
            codeToSave = parseInt(docRes.nextValue, 10);
        }
        createDto.WarehouseDocumentTypeCode = codeToSave;
        await this.validateDuplicates(createDto);
        const id = await this.idGenerationService.generateNextId('WarehouseDocumentTypes');
        const entity = {
            ...createDto,
            WarehouseDocumentTypeID: id,
            WarehouseDocumentTypeCode: codeToSave,
            creator: userId || 1,
            companyRef: createDto.companyRef || companyId,
            businessStructureRef: createDto.businessStructureRef || bsId,
        };
        return this.repository.create(entity);
    }
    async update(id, updateDto) {
        await this.findOne(id);
        await this.validateFields(updateDto, false);
        await this.validateDuplicates(updateDto, id);
        const entityToSave = {
            ...updateDto,
            lastModifier: this.requestContextService.getUserId() || 1,
        };
        return this.repository.update(id, entityToSave);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repository.delete(id);
    }
};
exports.WarehouseDocumentTypeService = WarehouseDocumentTypeService;
exports.WarehouseDocumentTypeService = WarehouseDocumentTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(warehouse_document_type_repository_interface_1.IWarehouseDocumentTypeRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], WarehouseDocumentTypeService);
//# sourceMappingURL=warehouse-document-type.service.js.map
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
exports.CostCenterService = void 0;
const common_1 = require("@nestjs/common");
const cost_center_repository_interface_1 = require("../../domain/repositories/cost-center.repository.interface");
const detailed_account_service_1 = require("./detailed-account.service");
const detailed_type_service_1 = require("./detailed-type.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let CostCenterService = class CostCenterService {
    constructor(costCenterRepository, detailedAccountService, detailedTypeService, requestContextService) {
        this.costCenterRepository = costCenterRepository;
        this.detailedAccountService = detailedAccountService;
        this.detailedTypeService = detailedTypeService;
        this.requestContextService = requestContextService;
    }
    async create(createDto) {
        let detailedAccountId = null;
        const detailedTypes = await this.detailedTypeService.findAll();
        const typeCostCenter = detailedTypes.find(t => t.code === '15');
        if (typeCostCenter) {
            const newDa = await this.detailedAccountService.create({
                code: createDto.detailedAccountCode,
                title: createDto.title,
                title_en: createDto.title_en,
                detailedTypesId: typeCostCenter.detailedTypesId,
                description: createDto.description,
                isActive: createDto.isActive ?? true,
            });
            detailedAccountId = newDa.detailedAccountId;
        }
        else {
            throw new Error("نوع تفصیل 'مراکز هزینه' (کد 15) یافت نشد.");
        }
        let bsId = this.requestContextService.getBusinessStructureId() || 2;
        let compId = this.requestContextService.getCompanyId() || 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        const data = {
            code: createDto.code,
            title: createDto.title,
            title_en: createDto.title_en,
            costCenterType: createDto.costCenterType,
            isActive: createDto.isActive,
            description: createDto.description,
            detailedAccountId: detailedAccountId,
            businessStructureRef: bsId,
            companyRef: compId,
        };
        return this.costCenterRepository.create(data);
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
            costCenterType: updateDto.costCenterType,
            isActive: updateDto.isActive,
            description: updateDto.description,
        };
        return this.costCenterRepository.update(id, data);
    }
    async findAll() {
        return this.costCenterRepository.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.costCenterRepository.findAdvanced(params);
        return { items, total };
    }
    async findOne(id) {
        const item = await this.costCenterRepository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`CostCenter with ID ${id} not found`);
        }
        return item;
    }
    async remove(id) {
        const existing = await this.findOne(id);
        const detailedAccountId = existing.detailedAccountId;
        await this.costCenterRepository.delete(id);
        if (detailedAccountId) {
            try {
                await this.detailedAccountService.remove(detailedAccountId);
            }
            catch (e) {
                console.error('Failed to delete detailed account:', e);
            }
        }
    }
    async bulkRemove(ids) {
        for (const id of ids) {
            await this.remove(id);
        }
    }
    async checkDuplicate(field, value, excludeId) {
        return this.costCenterRepository.checkDuplicate(field, value, excludeId);
    }
    async getNextCode() {
        const maxCode = await this.costCenterRepository.getMaxCode(1);
        return maxCode + 1;
    }
};
exports.CostCenterService = CostCenterService;
exports.CostCenterService = CostCenterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cost_center_repository_interface_1.ICostCenterRepositoryToken)),
    __metadata("design:paramtypes", [Object, detailed_account_service_1.DetailedAccountService,
        detailed_type_service_1.DetailedTypeService,
        request_context_service_1.RequestContextService])
], CostCenterService);
//# sourceMappingURL=cost-center.service.js.map
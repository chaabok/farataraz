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
exports.PettyCashService = void 0;
const common_1 = require("@nestjs/common");
const petty_cash_entity_1 = require("../../domain/entities/petty-cash.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let PettyCashService = class PettyCashService {
    constructor(repository, idService, requestContext) {
        this.repository = repository;
        this.idService = idService;
        this.requestContext = requestContext;
    }
    async findAll() {
        const companyId = (this.requestContext.getCompanyId() && this.requestContext.getCompanyId() > 1) ? this.requestContext.getCompanyId() : 2;
        const businessStructureId = (this.requestContext.getBusinessStructureId() && this.requestContext.getBusinessStructureId() > 1) ? this.requestContext.getBusinessStructureId() : 2;
        const fiscalYearId = this.requestContext.getFiscalYearId() || 1;
        return this.repository.findAll(companyId, businessStructureId, fiscalYearId);
    }
    async findOne(id) {
        const fiscalYearId = this.requestContext.getFiscalYearId() || 1;
        const entity = await this.repository.findById(id, fiscalYearId);
        if (!entity)
            throw new common_1.NotFoundException('PettyCash not found');
        return entity;
    }
    async create(dto) {
        const companyId = this.requestContext.getCompanyId() || 2;
        const businessStructureId = this.requestContext.getBusinessStructureId() || 2;
        const userId = this.requestContext.getUserId() || 1;
        const entity = new petty_cash_entity_1.PettyCash();
        const id = await this.idService.generateNextId('PettyCash');
        Object.assign(entity, dto);
        entity.pettyCashId = id;
        entity.companyRef = companyId;
        entity.businessStructureRef = businessStructureId;
        entity.creator = userId;
        entity.lastModifier = userId;
        return this.repository.create(entity);
    }
    async update(id, dto) {
        const entity = await this.findOne(id);
        const userId = this.requestContext.getUserId() || 1;
        Object.assign(entity, dto);
        if (dto.openingDate) {
            entity.openingDate = new Date(dto.openingDate);
        }
        entity.lastModifier = userId;
        return this.repository.update(entity);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repository.delete(id);
    }
    async isUsed(id) {
        return this.repository.isUsed(id);
    }
};
exports.PettyCashService = PettyCashService;
exports.PettyCashService = PettyCashService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IPettyCashRepository')),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], PettyCashService);
//# sourceMappingURL=petty-cash.service.js.map
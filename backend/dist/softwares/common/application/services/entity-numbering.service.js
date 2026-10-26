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
exports.EntityNumberingService = void 0;
const common_1 = require("@nestjs/common");
const entity_numbering_repository_interface_1 = require("../../domain/repositories/entity-numbering.repository.interface");
const base_settings_service_1 = require("./base-settings.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let EntityNumberingService = class EntityNumberingService {
    constructor(repo, baseSettingsService, requestContextService) {
        this.repo = repo;
        this.baseSettingsService = baseSettingsService;
        this.requestContextService = requestContextService;
    }
    async resolveTenantContext() {
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        const companyId = this.requestContextService.getCompanyId() || 2;
        let resolvedBSRef = businessStructureId;
        const isShared = false;
        try {
            const db = this.repo.repo.manager;
            const structures = await db.query(`SELECT "BusinessStructureID", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1`, [businessStructureId]);
            if (structures && structures.length > 0) {
                const bs = structures[0];
                const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
                const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
                if (bsType === 2 && parentRef > 0) {
                    resolvedBSRef = parentRef;
                }
            }
        }
        catch (e) {
            console.error('entity-numbering.service: resolve business structure failed:', e);
        }
        if (isShared) {
            return {
                businessStructureRef: resolvedBSRef,
                companyRef: resolvedBSRef,
            };
        }
        else {
            return {
                businessStructureRef: resolvedBSRef,
                companyRef: companyId,
            };
        }
    }
    async findByEntityRef(entityRef) {
        const { businessStructureRef, companyRef } = await this.resolveTenantContext();
        return this.repo.findByEntityRef(entityRef, businessStructureRef, companyRef);
    }
    async save(entityRef, data) {
        const { businessStructureRef, companyRef } = await this.resolveTenantContext();
        return this.repo.upsert(entityRef, data, businessStructureRef, companyRef);
    }
    async findAll() {
        return this.repo.findAll();
    }
    async remove(entityRef) {
        const { businessStructureRef, companyRef } = await this.resolveTenantContext();
        await this.repo.deleteByEntityRef(entityRef, businessStructureRef, companyRef);
    }
};
exports.EntityNumberingService = EntityNumberingService;
exports.EntityNumberingService = EntityNumberingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(entity_numbering_repository_interface_1.IEntityNumberingRepositoryToken)),
    __metadata("design:paramtypes", [Object, base_settings_service_1.BaseSettingsService,
        request_context_service_1.RequestContextService])
], EntityNumberingService);
//# sourceMappingURL=entity-numbering.service.js.map
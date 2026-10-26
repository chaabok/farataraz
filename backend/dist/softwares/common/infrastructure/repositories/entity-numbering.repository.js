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
exports.EntityNumberingRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entity_numbering_entity_1 = require("../../domain/entities/entity-numbering.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let EntityNumberingRepository = class EntityNumberingRepository {
    constructor(repo, idGenerationService, requestContextService) {
        this.repo = repo;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async create(data, businessStructureRef, companyRef) {
        const nextId = await this.idGenerationService.generateNextId('EntityNumbering');
        const entity = this.repo.create({
            ...data,
            entityNumberingId: nextId,
            businessStructureRef,
            companyRef,
        });
        return this.repo.save(entity);
    }
    async update(id, data) {
        await this.repo.update({ entityNumberingId: id }, data);
        return this.repo.findOne({ where: { entityNumberingId: id } });
    }
    async findAll() {
        return this.repo.find();
    }
    async findByEntityRef(entityRef, businessStructureRef, companyRef) {
        const rawRef = entityRef.replace(/^entity\./, '');
        const altRefs = Array.from(new Set([entityRef, rawRef, `entity.${rawRef}`]));
        for (const ref of altRefs) {
            const found = await this.repo.findOne({
                where: { entityRef: ref, businessStructureRef, companyRef }
            });
            if (found)
                return found;
        }
        for (const ref of altRefs) {
            const found = await this.repo.findOne({
                where: { entityRef: ref, businessStructureRef }
            });
            if (found)
                return found;
        }
        for (const ref of altRefs) {
            const found = await this.repo.findOne({
                where: { entityRef: ref }
            });
            if (found)
                return found;
        }
        return null;
    }
    async upsert(entityRef, data, businessStructureRef, companyRef) {
        const existing = await this.findByEntityRef(entityRef, businessStructureRef, companyRef);
        if (existing) {
            return this.update(existing.entityNumberingId, data);
        }
        else {
            return this.create({ ...data, entityRef }, businessStructureRef, companyRef);
        }
    }
    async deleteByEntityRef(entityRef, businessStructureRef, companyRef) {
        const query = { entityRef: entityRef };
        if (businessStructureRef) {
            query.businessStructureRef = businessStructureRef;
        }
        if (companyRef !== undefined) {
            query.companyRef = companyRef;
        }
        await this.repo.delete(query);
    }
};
exports.EntityNumberingRepository = EntityNumberingRepository;
exports.EntityNumberingRepository = EntityNumberingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entity_numbering_entity_1.EntityNumbering)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], EntityNumberingRepository);
//# sourceMappingURL=entity-numbering.repository.js.map
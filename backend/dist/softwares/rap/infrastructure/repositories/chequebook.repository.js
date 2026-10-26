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
exports.ChequebookRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chequebook_entity_1 = require("../../domain/entities/chequebook.entity");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let ChequebookRepository = class ChequebookRepository {
    constructor(repository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        const compId = this.requestContextService.getCompanyId() ?? 2;
        let isShared = true;
        try {
            const rows = await this.repository.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
            if (rows && rows.length > 0) {
                if (rows.some((r) => {
                    const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                    return val === false || val === 0 || val === 'false' || val === null;
                })) {
                    isShared = false;
                }
            }
            else {
                isShared = false;
            }
        }
        catch (e) {
            isShared = false;
        }
        return { bsId, compId, isShared };
    }
    async create(chequebook) {
        const { bsId, compId, isShared } = await this.getScope();
        if (chequebook.series) {
            const qb = this.repository.createQueryBuilder('chequebook')
                .where('chequebook.series = :series', { series: chequebook.series });
            if (isShared) {
                qb.andWhere('chequebook.businessStructureRef = :bsId', { bsId });
            }
            else {
                qb.andWhere('chequebook.companyRef = :compId', { compId });
            }
            const existing = await qb.getOne();
            if (existing) {
                throw new Error("Chequebook with this series already exists in the current scope.");
            }
        }
        const nextChequebookId = await this.idGenerationService.generateNextId('Chequebooks');
        chequebook.chequebookId = nextChequebookId;
        if (chequebook.items && Array.isArray(chequebook.items)) {
            const newItems = chequebook.items.filter(item => !item.chequebookItemId || item.id?.toString().startsWith('temp'));
            if (newItems.length > 0) {
                const startId = await this.idGenerationService.generateNextIdBlock('ChequebookItems', newItems.length);
                let currentId = startId;
                for (const item of chequebook.items) {
                    if (!item.chequebookItemId || item.id?.toString().startsWith('temp')) {
                        item.chequebookItemId = currentId++;
                        item.chequebookRef = chequebook.chequebookId;
                    }
                    delete item.id;
                }
            }
            else {
                for (const item of chequebook.items) {
                    delete item.id;
                }
            }
        }
        const userId = this.requestContextService.getUserId() || 1;
        chequebook.businessStructureRef = bsId;
        chequebook.companyRef = compId;
        chequebook.creator = userId;
        chequebook.lastModifier = userId;
        const newRecord = this.repository.create(chequebook);
        return await this.repository.save(newRecord);
    }
    async update(id, chequebook) {
        const existing = await this.findById(id);
        if (!existing) {
            throw new Error("Record not found");
        }
        if (chequebook.items && Array.isArray(chequebook.items)) {
            const newItems = chequebook.items.filter(item => !item.chequebookItemId || item.id?.toString().startsWith('temp'));
            if (newItems.length > 0) {
                const startId = await this.idGenerationService.generateNextIdBlock('ChequebookItems', newItems.length);
                let currentId = startId;
                for (const item of chequebook.items) {
                    if (!item.chequebookItemId || item.id?.toString().startsWith('temp')) {
                        item.chequebookItemId = currentId++;
                        item.chequebookRef = existing.chequebookId;
                    }
                    delete item.id;
                }
            }
            else {
                for (const item of chequebook.items) {
                    delete item.id;
                }
            }
        }
        const userId = this.requestContextService.getUserId() || 1;
        chequebook.lastModifier = userId;
        const updated = this.repository.merge(existing, chequebook);
        return await this.repository.save(updated);
    }
    async delete(id) {
        await this.repository.delete({ chequebookId: id });
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('chequebook')
            .leftJoinAndSelect('chequebook.bankAccount', 'bankAccount')
            .leftJoinAndSelect('chequebook.items', 'items')
            .where('chequebook.chequebookId = :id', { id });
        if (isShared) {
            qb.andWhere('chequebook.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('chequebook.companyRef = :compId', { compId });
        }
        return await qb.getOne();
    }
    async findAll(options) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('chequebook')
            .leftJoinAndSelect('chequebook.bankAccount', 'bankAccount')
            .leftJoinAndSelect('chequebook.items', 'items');
        if (isShared) {
            qb.where('chequebook.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('chequebook.companyRef = :compId', { compId });
        }
        if (options) {
            (0, typeorm_query_builder_1.applyDataGridParams)(qb, options, 'chequebook');
        }
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
};
exports.ChequebookRepository = ChequebookRepository;
exports.ChequebookRepository = ChequebookRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chequebook_entity_1.Chequebook)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], ChequebookRepository);
//# sourceMappingURL=chequebook.repository.js.map
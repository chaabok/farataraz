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
exports.TrackingFactorRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tracking_factor_entity_1 = require("../../domain/entities/tracking-factor.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let TrackingFactorRepository = class TrackingFactorRepository {
    constructor(repository, requestContextService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
    }
    get manager() {
        return this.repository.manager;
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
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
        catch (err) {
            isShared = false;
        }
        return { bsId, compId, isShared };
    }
    async checkDuplicate(field, value, excludeId) {
        if (value === undefined || value === null)
            return false;
        if (typeof value === 'string' && value.trim() === '')
            return false;
        const { bsId, compId, isShared } = await this.getScope();
        const where = {};
        if (typeof value === 'string') {
            where[field] = value.trim();
        }
        else {
            where[field] = value;
        }
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        if (excludeId) {
            where.TrackingFactorID = (0, typeorm_2.Not)(excludeId);
        }
        const count = await this.repository.count({ where });
        return count > 0;
    }
    async checkDuplicateCode(code, excludeId) {
        return this.checkDuplicate('TrackingFactorCode', code, excludeId);
    }
    async checkDuplicatePriority(priority, excludeId) {
        return this.checkDuplicate('DisplayPriority', priority, excludeId);
    }
    async checkDuplicateName(name, excludeId) {
        return this.checkDuplicate('TrackingFactorName', name, excludeId);
    }
    async checkDuplicateName2(name2, excludeId) {
        return this.checkDuplicate('TrackingFactorName2', name2, excludeId);
    }
    async findAll(criteria) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = criteria?.where ? { ...criteria.where } : {};
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        return this.repository.find({
            ...criteria,
            where,
            relations: ['relatedItems', 'relatedItems.item', 'constantValues'],
            order: { DisplayPriority: 'ASC', TrackingFactorCode: 'ASC' },
        });
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { TrackingFactorID: id };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        return this.repository.findOne({
            where,
            relations: ['relatedItems', 'relatedItems.item', 'constantValues'],
        });
    }
    async create(entity) {
        const { bsId, compId } = await this.getScope();
        if (!entity.businessStructureRef || entity.businessStructureRef <= 1) {
            entity.businessStructureRef = bsId;
        }
        if (!entity.companyRef || entity.companyRef <= 1) {
            entity.companyRef = compId;
        }
        const { relatedItems, ...cleanEntity } = entity;
        const newEntity = this.repository.create(cleanEntity);
        return this.repository.save(newEntity);
    }
    async update(id, entity) {
        const { relatedItems, ...cleanEntity } = entity;
        await this.repository.update(id, cleanEntity);
        return this.findById(id);
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async count(criteria) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = criteria?.where ? { ...criteria.where } : {};
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        return this.repository.count({ where });
    }
    async calculateNextCode() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('tf');
        if (isShared) {
            qb.where('tf.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('tf.companyRef = :compId', { compId });
        }
        const result = await qb
            .select('MAX(tf.TrackingFactorCode)', 'maxCode')
            .getRawOne();
        if (result && result.maxCode !== null && result.maxCode !== undefined) {
            const maxVal = Number(result.maxCode);
            if (!isNaN(maxVal) && maxVal > 0) {
                return maxVal + 1;
            }
        }
        return 1;
    }
    async calculateNextPriority() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('tf');
        if (isShared) {
            qb.where('tf.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('tf.companyRef = :compId', { compId });
        }
        const result = await qb
            .select('MAX(tf.DisplayPriority)', 'maxPriority')
            .getRawOne();
        if (result && result.maxPriority !== null && result.maxPriority !== undefined) {
            const maxVal = Number(result.maxPriority);
            if (!isNaN(maxVal) && maxVal > 0) {
                return maxVal + 1;
            }
        }
        return 1;
    }
};
exports.TrackingFactorRepository = TrackingFactorRepository;
exports.TrackingFactorRepository = TrackingFactorRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tracking_factor_entity_1.TrackingFactor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], TrackingFactorRepository);
//# sourceMappingURL=tracking-factor.repository.js.map
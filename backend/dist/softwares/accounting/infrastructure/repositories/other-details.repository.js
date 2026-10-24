"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtherDetailsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const other_details_entity_1 = require("../../domain/entities/other-details.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let OtherDetailsRepository = class OtherDetailsRepository {
    constructor(typeOrmRepo, idGenerationService, requestContextService) {
        this.typeOrmRepo = typeOrmRepo;
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
        let isShared = true;
        try {
            const rows = await this.typeOrmRepo.manager.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
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
    async create(data) {
        const { bsId, compId } = await this.getScope();
        const manualId = data.otherDetailsId;
        const nextId = manualId || await this.idGenerationService.generateNextId('OtherDetails');
        const newEntity = this.typeOrmRepo.create({
            ...data,
            otherDetailsId: nextId,
            businessStructureRef: (data.businessStructureRef && data.businessStructureRef > 1) ? data.businessStructureRef : bsId,
            companyRef: (data.companyRef && data.companyRef > 1) ? data.companyRef : compId,
        });
        try {
            return await this.typeOrmRepo.save(newEntity);
        }
        catch (error) {
            if (error.code === '23505' || error.number === 2627) {
                throw new common_1.ConflictException('عنوان وارد شده قبلا ثبت شده است');
            }
            throw error;
        }
    }
    async update(id, data) {
        try {
            const existingEntity = await this.findById(id);
            if (!existingEntity)
                throw new Error('OtherDetails not found');
            const updatedEntity = this.typeOrmRepo.merge(existingEntity, data);
            return await this.typeOrmRepo.save(updatedEntity);
        }
        catch (error) {
            if (error.code === '23505' || error.number === 2627) {
                throw new common_1.ConflictException('عنوان وارد شده قبلا ثبت شده است');
            }
            throw error;
        }
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.typeOrmRepo.find({ where });
    }
    async findWithPagination(skip, take) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.typeOrmRepo.findAndCount({
            where,
            skip,
            take,
            order: { otherDetailsId: 'ASC' }
        });
    }
    async findAdvanced(params) {
        const { applyDataGridParams } = await Promise.resolve().then(() => __importStar(require('../../../../core/utils/typeorm-query-builder')));
        const { bsId, compId, isShared } = await this.getScope();
        const queryBuilder = this.typeOrmRepo.createQueryBuilder('od');
        if (isShared) {
            queryBuilder.where('od.businessStructureRef = :bsId', { bsId });
        }
        else {
            queryBuilder.where('od.companyRef = :compId', { compId });
        }
        applyDataGridParams(queryBuilder, params, 'od');
        if (!params.sorting || params.sorting === '[]') {
            queryBuilder.orderBy('LENGTH(od.title)', 'ASC').addOrderBy('od.title', 'ASC');
        }
        return queryBuilder.getManyAndCount();
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { otherDetailsId: id };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.typeOrmRepo.findOne({ where });
    }
    async delete(id) {
        await this.typeOrmRepo.delete({ otherDetailsId: id });
    }
    async checkDuplicate(field, value, excludeId) {
        if (!['title', 'title_en'].includes(field)) {
            throw new Error(`Invalid field for duplicate check: ${field}`);
        }
        const { bsId, compId, isShared } = await this.getScope();
        const query = this.typeOrmRepo.createQueryBuilder('od');
        if (typeof value === 'string' && (field === 'title' || field === 'title_en')) {
            const normalizedValue = value.replace(/[\s\u200c]+/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
            query.where(`REPLACE(REPLACE(REPLACE(REPLACE(CAST(od.${field} AS text), ' ', ''), CHR(8204), ''), 'ي', 'ی'), 'ك', 'ک') = :value`, { value: normalizedValue });
        }
        else {
            query.where(`od.${field} = :value`, { value });
        }
        if (isShared) {
            query.andWhere('od.businessStructureRef = :bsId', { bsId });
        }
        else {
            query.andWhere('od.companyRef = :compId', { compId });
        }
        if (excludeId) {
            query.andWhere('od.otherDetailsId != :excludeId', { excludeId: excludeId });
        }
        const count = await query.getCount();
        return count > 0;
    }
};
exports.OtherDetailsRepository = OtherDetailsRepository;
exports.OtherDetailsRepository = OtherDetailsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(other_details_entity_1.OtherDetails)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], OtherDetailsRepository);
//# sourceMappingURL=other-details.repository.js.map
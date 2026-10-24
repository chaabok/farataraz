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
exports.DetailedAccountRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const detailed_account_entity_1 = require("../../domain/entities/detailed-account.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let DetailedAccountRepository = class DetailedAccountRepository {
    constructor(typeOrmRepo, idGenerationService, requestContextService) {
        this.typeOrmRepo = typeOrmRepo;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async getScope(overrideBsId) {
        let bsId = overrideBsId ?? this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = overrideBsId ?? this.requestContextService.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        let isShared = true;
        let hqId = bsId;
        try {
            const rows = await this.typeOrmRepo.manager.query(`SELECT "BusinessStructureID", "IsBasicInfoShared", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
            if (rows && rows.length > 0) {
                if (rows.some((bs) => {
                    const isSharedVal = bs.IsBasicInfoShared !== undefined ? bs.IsBasicInfoShared : bs.is_basic_info_shared;
                    return isSharedVal === false || isSharedVal === 0 || isSharedVal === 'false' || isSharedVal === null;
                })) {
                    isShared = false;
                }
                const currRow = rows.find((r) => (r.BusinessStructureID || r.business_structure_id) === bsId) || rows[0];
                const parentRefVal = currRow.ParentRef !== undefined ? currRow.ParentRef : currRow.parent_ref;
                const parentRef = parentRefVal !== undefined && parentRefVal !== null ? parseInt(parentRefVal.toString(), 10) : 0;
                const bsTypeVal = currRow.BusinessStructure !== undefined ? currRow.BusinessStructure : currRow.business_structure;
                const bsEnum = bsTypeVal !== undefined && bsTypeVal !== null ? parseInt(bsTypeVal.toString(), 10) : 0;
                if (bsEnum !== 1 && parentRef > 0) {
                    hqId = parentRef;
                }
            }
            else {
                isShared = false;
            }
        }
        catch (err) {
            isShared = false;
        }
        return { bsId, compId, hqId, isShared };
    }
    async create(data) {
        const manualId = data.detailedAccountId;
        const nextId = manualId || await this.idGenerationService.generateNextId('DetailedAccount');
        const useOverride = data.businessStructureRef ? parseInt(data.businessStructureRef, 10) : undefined;
        const { compId, hqId } = await this.getScope(useOverride);
        const newEntity = this.typeOrmRepo.create({
            ...data,
            detailedAccountId: nextId,
            businessStructureRef: hqId,
            companyRef: compId
        });
        try {
            return await this.typeOrmRepo.save(newEntity);
        }
        catch (error) {
            if (error.code === '23505' || error.number === 2627) {
                throw new common_1.ConflictException('کد یا عنوان وارد شده قبلا ثبت شده است');
            }
            throw error;
        }
    }
    async update(id, data) {
        try {
            const existingEntity = await this.findById(id);
            if (!existingEntity)
                throw new Error('DetailedAccount not found');
            const updatedEntity = this.typeOrmRepo.merge(existingEntity, data);
            return await this.typeOrmRepo.save(updatedEntity);
        }
        catch (error) {
            if (error.code === '23505' || error.number === 2627) {
                throw new common_1.ConflictException('کد یا عنوان وارد شده قبلا ثبت شده است');
            }
            throw error;
        }
    }
    async findAll() {
        const { compId, hqId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: hqId } : { companyRef: compId };
        return this.typeOrmRepo.find({
            where,
            order: { detailedAccountId: 'DESC' },
            relations: ['detailedType']
        });
    }
    async findWithPagination(skip, take) {
        const { compId, hqId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: hqId } : { companyRef: compId };
        return this.typeOrmRepo.findAndCount({
            where,
            skip,
            take,
            order: { detailedAccountId: 'DESC' },
            relations: ['detailedType']
        });
    }
    async findAdvanced(params) {
        const { applyDataGridParams } = await Promise.resolve().then(() => __importStar(require('../../../../core/utils/typeorm-query-builder')));
        const { compId, hqId, isShared } = await this.getScope();
        const queryBuilder = this.typeOrmRepo.createQueryBuilder('da');
        queryBuilder.leftJoinAndSelect('da.detailedType', 'dt');
        if (isShared) {
            queryBuilder.where('da.businessStructureRef = :hqId', { hqId });
        }
        else {
            queryBuilder.where('da.companyRef = :compId', { compId });
        }
        applyDataGridParams(queryBuilder, params, 'da');
        return queryBuilder.getManyAndCount();
    }
    async findById(id) {
        return this.typeOrmRepo.findOne({
            where: { detailedAccountId: id },
            relations: ['detailedType']
        });
    }
    async delete(id) {
        await this.typeOrmRepo.delete(id);
    }
    async countByDetailedTypeId(detailedTypesId) {
        return this.typeOrmRepo.count({ where: { detailedTypesId: detailedTypesId } });
    }
    async checkDuplicate(field, value, excludeId) {
        if (!['code', 'title', 'title_en'].includes(field)) {
            throw new Error(`Invalid field for duplicate check: ${field}`);
        }
        const { compId, hqId, isShared } = await this.getScope();
        const query = this.typeOrmRepo.createQueryBuilder('da');
        if (typeof value === 'string' && (field === 'title' || field === 'title_en')) {
            const normalizedValue = value.replace(/[\s\u200c]+/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
            query.where(`REPLACE(REPLACE(REPLACE(REPLACE(CAST(da.${field} AS text), ' ', ''), CHR(8204), ''), 'ي', 'ی'), 'ك', 'ک') = :value`, { value: normalizedValue });
        }
        else {
            query.where(`da.${field} = :value`, { value });
        }
        if (isShared) {
            query.andWhere('da.businessStructureRef = :hqId', { hqId });
        }
        else {
            query.andWhere('da.companyRef = :compId', { compId });
        }
        if (excludeId) {
            query.andWhere('da.detailedAccountId != :excludeId', { excludeId: parseInt(excludeId, 10) });
        }
        const count = await query.getCount();
        return count > 0;
    }
};
exports.DetailedAccountRepository = DetailedAccountRepository;
exports.DetailedAccountRepository = DetailedAccountRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(detailed_account_entity_1.DetailedAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], DetailedAccountRepository);
//# sourceMappingURL=detailed-account.repository.js.map
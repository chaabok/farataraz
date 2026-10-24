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
exports.CostCenterRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cost_center_entity_1 = require("../../domain/entities/cost-center.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
let CostCenterRepository = class CostCenterRepository {
    constructor(typeOrmRepo, idGenService, requestContextService) {
        this.typeOrmRepo = typeOrmRepo;
        this.idGenService = idGenService;
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
        const id = await this.idGenService.generateNextId('CostCenter');
        const newEntity = this.typeOrmRepo.create({
            ...data,
            costCenterId: id,
            businessStructureRef: (data.businessStructureRef && data.businessStructureRef > 1) ? data.businessStructureRef : bsId,
            companyRef: (data.companyRef && data.companyRef > 1) ? data.companyRef : compId,
        });
        return this.typeOrmRepo.save(newEntity);
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new Error('CostCenter not found');
        const updated = this.typeOrmRepo.merge(existing, data);
        return this.typeOrmRepo.save(updated);
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.typeOrmRepo.find({
            where,
            relations: ['detailedAccount'],
            order: { costCenterId: 'DESC' }
        });
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { costCenterId: id };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.typeOrmRepo.findOne({
            where,
            relations: ['detailedAccount']
        });
    }
    async delete(id) {
        await this.typeOrmRepo.delete({ costCenterId: id });
    }
    async findAdvanced(params) {
        const { bsId, compId, isShared } = await this.getScope();
        let qb = this.typeOrmRepo.createQueryBuilder('c')
            .leftJoinAndSelect('c.detailedAccount', 'da');
        if (isShared) {
            qb.where('c.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('c.companyRef = :compId', { compId });
        }
        qb = (0, typeorm_query_builder_1.applyDataGridParams)(qb, params, 'c');
        return qb.getManyAndCount();
    }
    async checkDuplicate(field, value, excludeId) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.typeOrmRepo.createQueryBuilder('e')
            .where(`e.${field} = :value`, { value });
        if (isShared) {
            qb.andWhere('e.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('e.companyRef = :compId', { compId });
        }
        if (excludeId) {
            qb.andWhere('e.costCenterId != :excludeId', { excludeId: parseInt(excludeId, 10) });
        }
        const count = await qb.getCount();
        return count > 0;
    }
    async getMaxCode(businessStructureRef) {
        const { bsId, compId, isShared } = await this.getScope();
        const whereCol = isShared ? 'c.businessStructureRef' : 'c.companyRef';
        const whereVal = isShared ? bsId : compId;
        const result = await this.typeOrmRepo.createQueryBuilder('c')
            .select('MAX(CAST(c.Code AS INT))', 'maxCode')
            .where(`${whereCol} = :val`, { val: whereVal })
            .getRawOne();
        if (result && result.maxCode) {
            return parseInt(result.maxCode, 10);
        }
        return 0;
    }
};
exports.CostCenterRepository = CostCenterRepository;
exports.CostCenterRepository = CostCenterRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cost_center_entity_1.CostCenter)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], CostCenterRepository);
//# sourceMappingURL=cost-center.repository.js.map
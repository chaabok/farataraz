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
exports.FiscalYearRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fiscal_year_entity_1 = require("../../domain/entities/fiscal-year.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let FiscalYearRepository = class FiscalYearRepository {
    constructor(repository, requestContextService, idGenerationService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
        this.idGenerationService = idGenerationService;
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
            const rows = await this.repository.manager.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
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
        const fiscalYearID = data.fiscalYearID || await this.idGenerationService.generateNextId('FiscalYear');
        const entity = this.repository.create({
            ...data,
            fiscalYearID,
            businessStructureRef: data.businessStructureRef || bsId,
            companyRef: data.companyRef || compId,
        });
        return this.repository.save(entity);
    }
    async update(id, data) {
        await this.repository.update(id, data);
        return this.findById(id);
    }
    async findById(id) {
        return this.repository.findOne({ where: { fiscalYearID: id } });
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.repository.find({
            where,
            order: { fiscalYearID: 'DESC' }
        });
    }
    async findWithPagination(skip, take) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.repository.findAndCount({
            where,
            skip,
            take,
            order: { fiscalYearID: 'DESC' }
        });
    }
    async findAdvanced(params) {
        const { bsId, compId, isShared } = await this.getScope();
        const { applyDataGridParams } = await Promise.resolve().then(() => __importStar(require('../../../../core/utils/typeorm-query-builder')));
        const queryBuilder = this.repository.createQueryBuilder('fiscalYear');
        if (isShared) {
            queryBuilder.where('fiscalYear.businessStructureRef = :bsId', { bsId });
        }
        else {
            queryBuilder.where('fiscalYear.companyRef = :compId', { compId });
        }
        applyDataGridParams(queryBuilder, params, 'fiscalYear');
        return queryBuilder.getManyAndCount();
    }
    async findByTitle(title) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared
            ? { title, businessStructureRef: bsId }
            : { title, companyRef: compId };
        return this.repository.findOne({ where });
    }
    async delete(id) {
        await this.repository.delete(id);
    }
};
exports.FiscalYearRepository = FiscalYearRepository;
exports.FiscalYearRepository = FiscalYearRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fiscal_year_entity_1.FiscalYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService])
], FiscalYearRepository);
//# sourceMappingURL=fiscal-year.repository.js.map
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
exports.CashRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cash_entity_1 = require("../../domain/entities/cash.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const base_settings_service_1 = require("../../../common/application/services/base-settings.service");
let CashRepository = class CashRepository {
    constructor(typeOrmRepo, idGenService, requestContextService, baseSettingsService) {
        this.typeOrmRepo = typeOrmRepo;
        this.idGenService = idGenService;
        this.requestContextService = requestContextService;
        this.baseSettingsService = baseSettingsService;
    }
    async getScope() {
        const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        const compId = this.requestContextService.getCompanyId() ?? 2;
        let isShared = true;
        try {
            const rows = await this.typeOrmRepo.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
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
        if (!data.cashId) {
            data.cashId = await this.idGenService.generateNextId('Cash');
        }
        const { bsId, compId } = await this.getScope();
        const item = this.typeOrmRepo.create({
            ...data,
            businessStructureRef: bsId,
            companyRef: compId,
        });
        return this.typeOrmRepo.save(item);
    }
    async update(id, data) {
        await this.typeOrmRepo.update(id, data);
        return this.findById(id);
    }
    async delete(id) {
        await this.typeOrmRepo.delete(id);
    }
    async findById(id) {
        return this.typeOrmRepo.findOne({
            where: { cashId: id },
            relations: ['detailedAccount', 'currency', 'cashiers', 'cashiers.user']
        });
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.typeOrmRepo.find({
            where,
            relations: ['detailedAccount', 'currency', 'cashiers', 'cashiers.user'],
            order: { cashId: 'DESC' }
        });
    }
    async findAdvanced(params) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.typeOrmRepo.createQueryBuilder('cash')
            .leftJoinAndSelect('cash.detailedAccount', 'detailedAccount')
            .leftJoinAndSelect('cash.currency', 'currency')
            .leftJoinAndSelect('cash.cashiers', 'cashiers')
            .leftJoinAndSelect('cashiers.user', 'user');
        if (isShared) {
            qb.where('cash.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('cash.companyRef = :compId', { compId });
        }
        Object.assign(params, { globalSearchFields: ['cash.code', 'cash.title', 'cash.title_en'] });
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, params, 'cash');
        return qb.getManyAndCount();
    }
    async checkDuplicate(field, value, excludeId) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { [field]: value };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        if (excludeId) {
            where.cashId = (0, typeorm_2.Not)(parseInt(excludeId, 10));
        }
        const count = await this.typeOrmRepo.count({ where });
        return count > 0;
    }
};
exports.CashRepository = CashRepository;
exports.CashRepository = CashRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cash_entity_1.Cash)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => base_settings_service_1.BaseSettingsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        base_settings_service_1.BaseSettingsService])
], CashRepository);
//# sourceMappingURL=cash.repository.js.map
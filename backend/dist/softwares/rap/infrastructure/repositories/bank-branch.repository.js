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
exports.BankBranchRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_branch_entity_1 = require("../../domain/entities/bank-branch.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const geo_location_entity_1 = require("../../../common/domain/entities/geo-location.entity");
const base_settings_service_1 = require("../../../common/application/services/base-settings.service");
let BankBranchRepository = class BankBranchRepository {
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
        if (!data.bankBranchId) {
            data.bankBranchId = await this.idGenService.generateNextId('BankBranch');
        }
        const { bsId, compId } = await this.getScope();
        const entity = this.typeOrmRepo.create({
            ...data,
            businessStructureRef: bsId,
            companyRef: compId
        });
        return this.typeOrmRepo.save(entity);
    }
    async update(id, data) {
        await this.typeOrmRepo.update(id, data);
    }
    async delete(id) {
        await this.typeOrmRepo.delete(id);
    }
    async findById(id) {
        return this.typeOrmRepo.findOne({
            where: { bankBranchId: id },
            relations: ['bank', 'city']
        });
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.typeOrmRepo.find({
            where,
            relations: ['bank', 'city'],
            order: { bankBranchId: 'DESC' }
        });
    }
    async findAdvanced(params) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.typeOrmRepo.createQueryBuilder('branch')
            .leftJoinAndSelect('branch.bank', 'bank')
            .leftJoinAndSelect('branch.city', 'city')
            .leftJoinAndMapOne('city.parent', geo_location_entity_1.GeoLocation, 'province', 'city.ParentRef = province.GeolocationID AND city.ParentRef > 0')
            .leftJoinAndMapOne('province.parent', geo_location_entity_1.GeoLocation, 'country', 'province.ParentRef = country.GeolocationID AND province.ParentRef > 0');
        if (isShared) {
            qb.where('branch.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('branch.companyRef = :compId', { compId });
        }
        Object.assign(params, { globalSearchFields: ['branch.branchCode', 'branch.title', 'branch.latinTitle', 'bank.title'] });
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, params, 'branch');
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
            where.bankBranchId = (0, typeorm_2.Not)(parseInt(excludeId, 10));
        }
        const count = await this.typeOrmRepo.count({ where });
        return count > 0;
    }
};
exports.BankBranchRepository = BankBranchRepository;
exports.BankBranchRepository = BankBranchRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_branch_entity_1.BankBranch)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => base_settings_service_1.BaseSettingsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        base_settings_service_1.BaseSettingsService])
], BankBranchRepository);
//# sourceMappingURL=bank-branch.repository.js.map
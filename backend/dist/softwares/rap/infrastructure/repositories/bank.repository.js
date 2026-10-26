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
exports.BankRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bank_entity_1 = require("../../domain/entities/bank.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const geo_location_entity_1 = require("../../../common/domain/entities/geo-location.entity");
const base_settings_service_1 = require("../../../common/application/services/base-settings.service");
let BankRepository = class BankRepository {
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
        if (!data.bankId) {
            data.bankId = await this.idGenService.generateNextId('Bank');
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
        return this.typeOrmRepo.findOne({ where: { bankId: id } });
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.typeOrmRepo.find({
            where,
            order: { bankId: 'DESC' }
        });
    }
    async findAdvanced(params) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.typeOrmRepo.createQueryBuilder('bank')
            .leftJoinAndMapOne('bank.nationalityLocation', geo_location_entity_1.GeoLocation, 'geoLocation', 'bank.NationalityRef = geoLocation.GeolocationID');
        if (isShared) {
            qb.where('bank.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('bank.companyRef = :compId', { compId });
        }
        Object.assign(params, { globalSearchFields: ['bank.code', 'bank.title', 'bank.latinTitle'] });
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, params, 'bank');
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
            where.bankId = (0, typeorm_2.Not)(parseInt(excludeId, 10));
        }
        const count = await this.typeOrmRepo.count({ where });
        return count > 0;
    }
};
exports.BankRepository = BankRepository;
exports.BankRepository = BankRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bank_entity_1.Bank)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => base_settings_service_1.BaseSettingsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService,
        base_settings_service_1.BaseSettingsService])
], BankRepository);
//# sourceMappingURL=bank.repository.js.map
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
exports.CurrencyRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const currency_entity_1 = require("../../domain/entities/currency.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let CurrencyRepository = class CurrencyRepository {
    constructor(typeOrmRepo, requestContextService, idGenService) {
        this.typeOrmRepo = typeOrmRepo;
        this.requestContextService = requestContextService;
        this.idGenService = idGenService;
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
    async create(currency) {
        const { bsId, compId } = await this.getScope();
        if (!currency.currencyID) {
            currency.currencyID = await this.idGenService.generateNextId('Currency');
        }
        if (!currency.businessStructureRef || currency.businessStructureRef <= 1) {
            currency.businessStructureRef = bsId;
        }
        if (!currency.companyRef || currency.companyRef <= 1) {
            currency.companyRef = compId;
        }
        const newCurrency = this.typeOrmRepo.create(currency);
        return this.typeOrmRepo.save(newCurrency);
    }
    async update(id, currency) {
        await this.typeOrmRepo.update(id, currency);
        return this.findById(id);
    }
    async findById(id) {
        return this.typeOrmRepo.findOne({ where: { currencyID: id } });
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.typeOrmRepo.find({ where, order: { code: 'ASC' } });
    }
    async delete(id) {
        await this.typeOrmRepo.delete(id);
    }
    async getMaxCode(businessStructureRef) {
        const { bsId, compId, isShared } = await this.getScope();
        const whereCol = isShared ? 'currency.businessStructureRef' : 'currency.companyRef';
        const whereVal = isShared ? bsId : compId;
        const result = await this.typeOrmRepo
            .createQueryBuilder('currency')
            .select('MAX(currency.code)', 'max')
            .where(`${whereCol} = :val`, { val: whereVal })
            .getRawOne();
        return result?.max ? parseInt(result.max, 10) : 0;
    }
    async findByTitle(title, businessStructureRef) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { title };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.typeOrmRepo.findOne({ where });
    }
    async findByTitleEn(titleEn, businessStructureRef) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { titleEn };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.typeOrmRepo.findOne({ where });
    }
    async findByCode(code, businessStructureRef) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { code };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.typeOrmRepo.findOne({ where });
    }
};
exports.CurrencyRepository = CurrencyRepository;
exports.CurrencyRepository = CurrencyRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(currency_entity_1.Currency)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService])
], CurrencyRepository);
//# sourceMappingURL=currency.repository.js.map
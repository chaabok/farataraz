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
exports.CurrencyExchangeRateRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const currency_exchange_rate_entity_1 = require("../../domain/entities/currency-exchange-rate.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let CurrencyExchangeRateRepository = class CurrencyExchangeRateRepository {
    constructor(repo, idGenService) {
        this.repo = repo;
        this.idGenService = idGenService;
    }
    async isBasicShared(businessStructureId) {
        try {
            const rows = await this.repo.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [businessStructureId]);
            if (rows && rows.length > 0) {
                if (rows.some((r) => {
                    const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                    return val === false || val === 0 || val === 'false' || val === null;
                })) {
                    return false;
                }
                return true;
            }
        }
        catch (err) { }
        return false;
    }
    async findAll(businessStructureRef, companyRef) {
        const isShared = await this.isBasicShared(businessStructureRef);
        const qb = this.repo.createQueryBuilder('rate')
            .leftJoinAndSelect('rate.baseCurrencyEntity', 'baseCurrency')
            .leftJoinAndSelect('rate.targetCurrencyEntity', 'targetCurrency');
        if (isShared) {
            qb.where('rate.businessStructureRef = :businessStructureRef', { businessStructureRef });
        }
        else {
            qb.where('rate.companyRef = :companyRef', { companyRef: companyRef ?? businessStructureRef });
        }
        return qb.getMany();
    }
    async findById(id, businessStructureRef, companyRef) {
        const isShared = await this.isBasicShared(businessStructureRef);
        const qb = this.repo.createQueryBuilder('rate')
            .leftJoinAndSelect('rate.baseCurrencyEntity', 'baseCurrency')
            .leftJoinAndSelect('rate.targetCurrencyEntity', 'targetCurrency')
            .where('rate.currencyExchangeRateId = :id', { id });
        if (isShared) {
            qb.andWhere('rate.businessStructureRef = :businessStructureRef', { businessStructureRef });
        }
        else {
            qb.andWhere('rate.companyRef = :companyRef', { companyRef: companyRef ?? businessStructureRef });
        }
        return qb.getOne();
    }
    async create(entity) {
        if (!entity.currencyExchangeRateId) {
            entity.currencyExchangeRateId = await this.idGenService.generateNextId('CurrencyExchangeRate');
        }
        return this.repo.save(entity);
    }
    async update(entity) {
        return this.repo.save(entity);
    }
    async delete(id) {
        await this.repo.delete({ currencyExchangeRateId: id });
    }
};
exports.CurrencyExchangeRateRepository = CurrencyExchangeRateRepository;
exports.CurrencyExchangeRateRepository = CurrencyExchangeRateRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(currency_exchange_rate_entity_1.CurrencyExchangeRate)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService])
], CurrencyExchangeRateRepository);
//# sourceMappingURL=currency-exchange-rate.repository.js.map
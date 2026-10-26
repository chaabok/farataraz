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
exports.CurrencyExchangeRateService = void 0;
const common_1 = require("@nestjs/common");
const currency_exchange_rate_entity_1 = require("../../domain/entities/currency-exchange-rate.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let CurrencyExchangeRateService = class CurrencyExchangeRateService {
    constructor(repo, idGenService) {
        this.repo = repo;
        this.idGenService = idGenService;
    }
    async findAll(businessStructureRef, companyRef) {
        return this.repo.findAll(businessStructureRef, companyRef);
    }
    async findById(id, businessStructureRef, companyRef) {
        const rate = await this.repo.findById(id, businessStructureRef, companyRef);
        if (!rate) {
            throw new common_1.NotFoundException('Currency Exchange Rate not found');
        }
        return rate;
    }
    async create(dto, businessStructureRef, companyRef, userId) {
        const entity = new currency_exchange_rate_entity_1.CurrencyExchangeRate();
        entity.currencyExchangeRateId = await this.idGenService.generateNextId('CurrencyExchangeRate');
        entity.baseCurrencyRef = dto.baseCurrencyRef;
        entity.targetCurrencyRef = dto.targetCurrencyRef;
        entity.effectiveDate = dto.effectiveDate;
        entity.exchangeRate = dto.exchangeRate;
        entity.businessStructureRef = businessStructureRef;
        entity.companyRef = companyRef;
        entity.creator = userId;
        entity.lastModifier = userId;
        return this.repo.create(entity);
    }
    async update(id, dto, businessStructureRef, companyRef, userId) {
        const entity = await this.findById(id, businessStructureRef, companyRef);
        if (dto.baseCurrencyRef !== undefined)
            entity.baseCurrencyRef = dto.baseCurrencyRef;
        if (dto.targetCurrencyRef !== undefined)
            entity.targetCurrencyRef = dto.targetCurrencyRef;
        if (dto.effectiveDate !== undefined)
            entity.effectiveDate = dto.effectiveDate;
        if (dto.exchangeRate !== undefined)
            entity.exchangeRate = dto.exchangeRate;
        entity.lastModifier = userId;
        return this.repo.update(entity);
    }
    async delete(id, businessStructureRef, companyRef) {
        const entity = await this.findById(id, businessStructureRef, companyRef);
        await this.repo.delete(entity.currencyExchangeRateId);
    }
};
exports.CurrencyExchangeRateService = CurrencyExchangeRateService;
exports.CurrencyExchangeRateService = CurrencyExchangeRateService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ICurrencyExchangeRateRepository')),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService])
], CurrencyExchangeRateService);
//# sourceMappingURL=currency-exchange-rate.service.js.map
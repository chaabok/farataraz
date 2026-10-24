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
exports.CurrencyExchangeRateController = void 0;
const common_1 = require("@nestjs/common");
const currency_exchange_rate_service_1 = require("../../application/services/currency-exchange-rate.service");
const create_currency_exchange_rate_dto_1 = require("../../application/dtos/create-currency-exchange-rate.dto");
const update_currency_exchange_rate_dto_1 = require("../../application/dtos/update-currency-exchange-rate.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let CurrencyExchangeRateController = class CurrencyExchangeRateController {
    constructor(service, requestContext) {
        this.service = service;
        this.requestContext = requestContext;
    }
    async findAll() {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        return this.service.findAll(businessStructureId, companyId);
    }
    async findOne(id) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        return this.service.findById(id, businessStructureId, companyId);
    }
    async create(dto) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        const userId = this.requestContext.getUserId();
        return this.service.create(dto, businessStructureId, companyId, userId);
    }
    async update(id, dto) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        const userId = this.requestContext.getUserId();
        return this.service.update(id, dto, businessStructureId, companyId, userId);
    }
    async remove(id) {
        const businessStructureId = this.requestContext.getBusinessStructureId();
        const companyId = this.requestContext.getCompanyId();
        await this.service.delete(id, businessStructureId, companyId);
        return { success: true };
    }
};
exports.CurrencyExchangeRateController = CurrencyExchangeRateController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurrencyExchangeRateController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CurrencyExchangeRateController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_currency_exchange_rate_dto_1.CreateCurrencyExchangeRateDto]),
    __metadata("design:returntype", Promise)
], CurrencyExchangeRateController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_currency_exchange_rate_dto_1.UpdateCurrencyExchangeRateDto]),
    __metadata("design:returntype", Promise)
], CurrencyExchangeRateController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CurrencyExchangeRateController.prototype, "remove", null);
exports.CurrencyExchangeRateController = CurrencyExchangeRateController = __decorate([
    (0, common_1.Controller)('common/currency-exchange-rates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [currency_exchange_rate_service_1.CurrencyExchangeRateService,
        request_context_service_1.RequestContextService])
], CurrencyExchangeRateController);
//# sourceMappingURL=currency-exchange-rate.controller.js.map
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
exports.CurrencyController = void 0;
const common_1 = require("@nestjs/common");
const currency_service_1 = require("../../application/services/currency.service");
const create_currency_dto_1 = require("../../application/dtos/create-currency.dto");
const update_currency_dto_1 = require("../../application/dtos/update-currency.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let CurrencyController = class CurrencyController {
    constructor(currencyService) {
        this.currencyService = currencyService;
    }
    async create(createCurrencyDto, companyId, branchId, agencyId) {
        const compId = companyId ? parseInt(companyId, 10) : 1;
        const brId = branchId ? parseInt(branchId, 10) : undefined;
        const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
        const data = await this.currencyService.create(createCurrencyDto, compId, brId, agnId);
        return { data, message: 'ارز با موفقیت ایجاد شد.' };
    }
    async getNextCode(companyId) {
        const compId = companyId ? parseInt(companyId, 10) : 1;
        const code = await this.currencyService.getNextCode(compId);
        return { data: code };
    }
    async findAll() {
        const data = await this.currencyService.findAll();
        return { data };
    }
    async findOne(id) {
        const data = await this.currencyService.findOne(id);
        return { data };
    }
    async update(id, updateCurrencyDto, companyId, branchId, agencyId) {
        const compId = companyId ? parseInt(companyId, 10) : 1;
        const brId = branchId ? parseInt(branchId, 10) : undefined;
        const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
        const data = await this.currencyService.update(id, updateCurrencyDto, compId, brId, agnId);
        return { data, message: 'ارز با موفقیت بروزرسانی شد.' };
    }
    async remove(id) {
        await this.currencyService.remove(id);
        return { message: 'ارز با موفقیت حذف شد.' };
    }
};
exports.CurrencyController = CurrencyController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('Currency:Create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('x-branch-id')),
    __param(3, (0, common_1.Headers)('x-agency-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_currency_dto_1.CreateCurrencyDto, String, String, String]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('next-code'),
    (0, permissions_decorator_1.Permissions)('Currency:Read'),
    __param(0, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "getNextCode", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('Currency:Read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('Currency:Read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('Currency:Update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('x-branch-id')),
    __param(4, (0, common_1.Headers)('x-agency-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_currency_dto_1.UpdateCurrencyDto, String, String, String]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('Currency:Delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CurrencyController.prototype, "remove", null);
exports.CurrencyController = CurrencyController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('common/currencies'),
    __metadata("design:paramtypes", [currency_service_1.CurrencyService])
], CurrencyController);
//# sourceMappingURL=currency.controller.js.map
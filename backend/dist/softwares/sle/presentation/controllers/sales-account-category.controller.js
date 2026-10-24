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
exports.SalesAccountCategoryController = void 0;
const common_1 = require("@nestjs/common");
const sales_account_category_service_1 = require("../../application/services/sales-account-category.service");
const create_sales_account_category_dto_1 = require("../../application/dtos/create-sales-account-category.dto");
const update_sales_account_category_dto_1 = require("../../application/dtos/update-sales-account-category.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let SalesAccountCategoryController = class SalesAccountCategoryController {
    constructor(service) {
        this.service = service;
    }
    async findAll(query) {
        return this.service.findAll(query);
    }
    async getNextNumber() {
        return this.service.getNextNumber();
    }
    async findOne(id) {
        const data = await this.service.findOne(Number(id));
        return { data, success: true };
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { data, success: true };
    }
    async update(id, dto) {
        const data = await this.service.update(Number(id), dto);
        return { data, success: true };
    }
    async remove(id) {
        await this.service.remove(Number(id));
        return { success: true };
    }
};
exports.SalesAccountCategoryController = SalesAccountCategoryController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalesAccountCategoryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesAccountCategoryController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesAccountCategoryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_account_category_dto_1.CreateSalesAccountCategoryDto]),
    __metadata("design:returntype", Promise)
], SalesAccountCategoryController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_sales_account_category_dto_1.UpdateSalesAccountCategoryDto]),
    __metadata("design:returntype", Promise)
], SalesAccountCategoryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesAccountCategoryController.prototype, "remove", null);
exports.SalesAccountCategoryController = SalesAccountCategoryController = __decorate([
    (0, common_1.Controller)('sle/sales-account-categories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [sales_account_category_service_1.SalesAccountCategoryService])
], SalesAccountCategoryController);
//# sourceMappingURL=sales-account-category.controller.js.map
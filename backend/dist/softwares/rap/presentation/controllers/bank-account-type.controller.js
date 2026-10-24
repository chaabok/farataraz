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
exports.BankAccountTypeController = void 0;
const common_1 = require("@nestjs/common");
const bank_account_type_service_1 = require("../../application/services/bank-account-type.service");
const create_bank_account_type_dto_1 = require("../../application/dtos/create-bank-account-type.dto");
const update_bank_account_type_dto_1 = require("../../application/dtos/update-bank-account-type.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let BankAccountTypeController = class BankAccountTypeController {
    constructor(service) {
        this.service = service;
    }
    async findAll(pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters) {
        if (pageIndex !== undefined && pageSize !== undefined) {
            return this.service.findWithPagination({
                pageIndex: parseInt(pageIndex, 10),
                pageSize: parseInt(pageSize, 10),
                sorting,
                columnFilters,
                globalFilter,
                advancedFilters,
            });
        }
        return await this.service.findAll();
    }
    async findById(id) {
        return await this.service.findById(id);
    }
    async create(dto) {
        return await this.service.create(dto);
    }
    async update(id, dto) {
        return await this.service.update(id, dto);
    }
    async delete(id) {
        await this.service.delete(id);
        return { success: true };
    }
};
exports.BankAccountTypeController = BankAccountTypeController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('view_bank_account_types'),
    __param(0, (0, common_1.Query)('pageIndex')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('sorting')),
    __param(3, (0, common_1.Query)('columnFilters')),
    __param(4, (0, common_1.Query)('globalFilter')),
    __param(5, (0, common_1.Query)('advancedFilters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BankAccountTypeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('view_bank_account_types'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BankAccountTypeController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('create_bank_account_types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bank_account_type_dto_1.CreateBankAccountTypeDto]),
    __metadata("design:returntype", Promise)
], BankAccountTypeController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('edit_bank_account_types'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_bank_account_type_dto_1.UpdateBankAccountTypeDto]),
    __metadata("design:returntype", Promise)
], BankAccountTypeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('delete_bank_account_types'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BankAccountTypeController.prototype, "delete", null);
exports.BankAccountTypeController = BankAccountTypeController = __decorate([
    (0, common_1.Controller)('rap/bank-account-types'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [bank_account_type_service_1.BankAccountTypeService])
], BankAccountTypeController);
//# sourceMappingURL=bank-account-type.controller.js.map
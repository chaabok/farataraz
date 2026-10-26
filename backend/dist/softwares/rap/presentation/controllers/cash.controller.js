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
exports.CashController = void 0;
const common_1 = require("@nestjs/common");
const cash_service_1 = require("../../application/services/cash.service");
const create_cash_dto_1 = require("../../application/dtos/create-cash.dto");
const update_cash_dto_1 = require("../../application/dtos/update-cash.dto");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let CashController = class CashController {
    constructor(cashService) {
        this.cashService = cashService;
    }
    async create(createCashDto) {
        return this.cashService.create(createCashDto);
    }
    async findAll(pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters) {
        if (pageIndex !== undefined && pageSize !== undefined) {
            return this.cashService.findWithPagination({
                pageIndex: parseInt(pageIndex, 10),
                pageSize: parseInt(pageSize, 10),
                sorting,
                columnFilters,
                globalFilter,
                advancedFilters,
            });
        }
        return this.cashService.findAll();
    }
    async findOne(id) {
        return this.cashService.findOne(+id);
    }
    async update(id, updateCashDto) {
        return this.cashService.update(+id, updateCashDto);
    }
    async remove(id) {
        await this.cashService.remove(+id);
        return { success: true };
    }
    async checkDuplicate(field, value, excludeId) {
        const isDuplicate = await this.cashService.checkDuplicate(field, value, excludeId ? +excludeId : undefined);
        return { isDuplicate };
    }
};
exports.CashController = CashController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('Cashes:Create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cash_dto_1.CreateCashDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('Cashes:View'),
    __param(0, (0, common_1.Query)('pageIndex')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('sorting')),
    __param(3, (0, common_1.Query)('columnFilters')),
    __param(4, (0, common_1.Query)('globalFilter')),
    __param(5, (0, common_1.Query)('advancedFilters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('Cashes:View'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('Cashes:Edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_cash_dto_1.UpdateCashDto]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('Cashes:Delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('advanced/check-duplicate'),
    (0, permissions_decorator_1.Permissions)('Cashes:View'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], CashController.prototype, "checkDuplicate", null);
exports.CashController = CashController = __decorate([
    (0, common_1.Controller)('rap/cashes'),
    __metadata("design:paramtypes", [cash_service_1.CashService])
], CashController);
//# sourceMappingURL=cash.controller.js.map
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
exports.BankController = void 0;
const common_1 = require("@nestjs/common");
const bank_service_1 = require("../../application/services/bank.service");
const create_bank_dto_1 = require("../../application/dtos/create-bank.dto");
const update_bank_dto_1 = require("../../application/dtos/update-bank.dto");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let BankController = class BankController {
    constructor(bankService) {
        this.bankService = bankService;
    }
    async create(createBankDto) {
        return this.bankService.create(createBankDto);
    }
    async findAll(pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters) {
        if (pageIndex !== undefined && pageSize !== undefined) {
            return this.bankService.findWithPagination({
                pageIndex: parseInt(pageIndex, 10),
                pageSize: parseInt(pageSize, 10),
                sorting,
                columnFilters,
                globalFilter,
                advancedFilters,
            });
        }
        return this.bankService.findAll();
    }
    async findOne(id) {
        return this.bankService.findOne(+id);
    }
    async update(id, updateBankDto) {
        return this.bankService.update(+id, updateBankDto);
    }
    async remove(id) {
        await this.bankService.remove(+id);
        return { success: true };
    }
    async checkDuplicate(field, value, excludeId) {
        const val = field === 'code' ? +value : value;
        const isDuplicate = await this.bankService.checkDuplicate(field, val, excludeId ? +excludeId : undefined);
        return { isDuplicate };
    }
};
exports.BankController = BankController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('Banks:Create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bank_dto_1.CreateBankDto]),
    __metadata("design:returntype", Promise)
], BankController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('Banks:View'),
    __param(0, (0, common_1.Query)('pageIndex')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('sorting')),
    __param(3, (0, common_1.Query)('columnFilters')),
    __param(4, (0, common_1.Query)('globalFilter')),
    __param(5, (0, common_1.Query)('advancedFilters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BankController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('Banks:View'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('Banks:Edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_bank_dto_1.UpdateBankDto]),
    __metadata("design:returntype", Promise)
], BankController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('Banks:Delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('advanced/check-duplicate'),
    (0, permissions_decorator_1.Permissions)('Banks:View'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BankController.prototype, "checkDuplicate", null);
exports.BankController = BankController = __decorate([
    (0, common_1.Controller)('rap/banks'),
    __metadata("design:paramtypes", [bank_service_1.BankService])
], BankController);
//# sourceMappingURL=bank.controller.js.map
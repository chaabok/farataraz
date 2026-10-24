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
exports.BankBranchController = void 0;
const common_1 = require("@nestjs/common");
const bank_branch_service_1 = require("../../application/services/bank-branch.service");
const create_bank_branch_dto_1 = require("../../application/dtos/create-bank-branch.dto");
const update_bank_branch_dto_1 = require("../../application/dtos/update-bank-branch.dto");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let BankBranchController = class BankBranchController {
    constructor(bankBranchService) {
        this.bankBranchService = bankBranchService;
    }
    async create(createBankBranchDto) {
        return this.bankBranchService.create(createBankBranchDto);
    }
    async findAll(pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters) {
        if (pageIndex !== undefined && pageSize !== undefined) {
            return this.bankBranchService.findWithPagination({
                pageIndex: parseInt(pageIndex, 10),
                pageSize: parseInt(pageSize, 10),
                sorting,
                columnFilters,
                globalFilter,
                advancedFilters,
            });
        }
        return this.bankBranchService.findAll();
    }
    async findOne(id) {
        return this.bankBranchService.findOne(+id);
    }
    async update(id, updateBankBranchDto) {
        return this.bankBranchService.update(+id, updateBankBranchDto);
    }
    async remove(id) {
        await this.bankBranchService.remove(+id);
        return { success: true };
    }
    async checkDuplicate(field, value, excludeId) {
        const isDuplicate = await this.bankBranchService.checkDuplicate(field, value, excludeId ? +excludeId : undefined);
        return { isDuplicate };
    }
};
exports.BankBranchController = BankBranchController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('BankBranchs:Create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bank_branch_dto_1.CreateBankBranchDto]),
    __metadata("design:returntype", Promise)
], BankBranchController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('BankBranchs:View'),
    __param(0, (0, common_1.Query)('pageIndex')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('sorting')),
    __param(3, (0, common_1.Query)('columnFilters')),
    __param(4, (0, common_1.Query)('globalFilter')),
    __param(5, (0, common_1.Query)('advancedFilters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BankBranchController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('BankBranchs:View'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankBranchController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('BankBranchs:Edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_bank_branch_dto_1.UpdateBankBranchDto]),
    __metadata("design:returntype", Promise)
], BankBranchController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('BankBranchs:Delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BankBranchController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('advanced/check-duplicate'),
    (0, permissions_decorator_1.Permissions)('BankBranchs:View'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BankBranchController.prototype, "checkDuplicate", null);
exports.BankBranchController = BankBranchController = __decorate([
    (0, common_1.Controller)('rap/bank-branchs'),
    __metadata("design:paramtypes", [bank_branch_service_1.BankBranchService])
], BankBranchController);
//# sourceMappingURL=bank-branch.controller.js.map
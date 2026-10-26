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
exports.BankReconciliationController = void 0;
const common_1 = require("@nestjs/common");
const bank_reconciliation_service_1 = require("../../application/services/bank-reconciliation.service");
const create_bank_reconciliation_dto_1 = require("../../application/dtos/create-bank-reconciliation.dto");
const update_bank_reconciliation_dto_1 = require("../../application/dtos/update-bank-reconciliation.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let BankReconciliationController = class BankReconciliationController {
    constructor(bankReconciliationService) {
        this.bankReconciliationService = bankReconciliationService;
    }
    create(createDto) {
        return this.bankReconciliationService.create(createDto);
    }
    findAll() {
        return this.bankReconciliationService.findAll();
    }
    getNextNumbers(date) {
        return this.bankReconciliationService.getNextNumbers(date || '');
    }
    findOne(id) {
        return this.bankReconciliationService.findOne(+id);
    }
    update(id, updateDto) {
        return this.bankReconciliationService.update(+id, updateDto);
    }
    remove(id) {
        return this.bankReconciliationService.remove(+id);
    }
};
exports.BankReconciliationController = BankReconciliationController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('rap.bankReconciliations.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bank_reconciliation_dto_1.CreateBankReconciliationDto]),
    __metadata("design:returntype", void 0)
], BankReconciliationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('rap.bankReconciliations.view'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BankReconciliationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-numbers'),
    (0, permissions_decorator_1.Permissions)('rap.bankReconciliations.view'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BankReconciliationController.prototype, "getNextNumbers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.bankReconciliations.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BankReconciliationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.bankReconciliations.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_bank_reconciliation_dto_1.UpdateBankReconciliationDto]),
    __metadata("design:returntype", void 0)
], BankReconciliationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.bankReconciliations.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BankReconciliationController.prototype, "remove", null);
exports.BankReconciliationController = BankReconciliationController = __decorate([
    (0, common_1.Controller)('rap/bank-reconciliations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [bank_reconciliation_service_1.BankReconciliationService])
], BankReconciliationController);
//# sourceMappingURL=bank-reconciliation.controller.js.map
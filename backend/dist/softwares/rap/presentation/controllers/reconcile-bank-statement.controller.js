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
exports.ReconcileBankStatementController = void 0;
const common_1 = require("@nestjs/common");
const reconcile_bank_statement_service_1 = require("../../application/services/reconcile-bank-statement.service");
const create_reconcile_bank_statement_dto_1 = require("../../application/dtos/create-reconcile-bank-statement.dto");
const update_reconcile_bank_statement_dto_1 = require("../../application/dtos/update-reconcile-bank-statement.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let ReconcileBankStatementController = class ReconcileBankStatementController {
    constructor(service) {
        this.service = service;
    }
    findAll() {
        return this.service.findAll();
    }
    getNextNumbers(date) {
        return this.service.getNextNumbers(date || '');
    }
    getSuggestedDates(bankAccountRef) {
        return this.service.getSuggestedDates(bankAccountRef);
    }
    findOne(id) {
        return this.service.findOne(+id);
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(+id, dto);
    }
    remove(id) {
        return this.service.remove(+id);
    }
};
exports.ReconcileBankStatementController = ReconcileBankStatementController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ReconcileBankStatementController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-numbers'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReconcileBankStatementController.prototype, "getNextNumbers", null);
__decorate([
    (0, common_1.Get)('suggested-dates'),
    __param(0, (0, common_1.Query)('bankAccountRef', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReconcileBankStatementController.prototype, "getSuggestedDates", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReconcileBankStatementController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_reconcile_bank_statement_dto_1.CreateReconcileBankStatementDto]),
    __metadata("design:returntype", void 0)
], ReconcileBankStatementController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_reconcile_bank_statement_dto_1.UpdateReconcileBankStatementDto]),
    __metadata("design:returntype", void 0)
], ReconcileBankStatementController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ReconcileBankStatementController.prototype, "remove", null);
exports.ReconcileBankStatementController = ReconcileBankStatementController = __decorate([
    (0, common_1.Controller)('rap/reconcile-bank-statements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [reconcile_bank_statement_service_1.ReconcileBankStatementService])
], ReconcileBankStatementController);
//# sourceMappingURL=reconcile-bank-statement.controller.js.map
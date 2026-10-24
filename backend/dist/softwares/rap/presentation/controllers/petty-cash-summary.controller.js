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
exports.PettyCashSummaryController = void 0;
const common_1 = require("@nestjs/common");
const petty_cash_summary_service_1 = require("../../application/services/petty-cash-summary.service");
const create_petty_cash_summary_dto_1 = require("../../application/dtos/create-petty-cash-summary.dto");
const update_petty_cash_summary_dto_1 = require("../../application/dtos/update-petty-cash-summary.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let PettyCashSummaryController = class PettyCashSummaryController {
    constructor(service) {
        this.service = service;
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    getNextNumbers(date) {
        return this.service.getNextNumbers(date || '');
    }
    findOne(id) {
        return this.service.findOne(+id);
    }
    create(createDto) {
        return this.service.create(createDto);
    }
    isUsed(id) {
        return this.service.isUsed(+id);
    }
    update(id, updateDto) {
        return this.service.update(+id, updateDto);
    }
    remove(id) {
        return this.service.remove(+id);
    }
};
exports.PettyCashSummaryController = PettyCashSummaryController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashSummaries.view'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PettyCashSummaryController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-numbers'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PettyCashSummaryController.prototype, "getNextNumbers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashSummaries.view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PettyCashSummaryController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashSummaries.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_petty_cash_summary_dto_1.CreatePettyCashSummaryDto]),
    __metadata("design:returntype", void 0)
], PettyCashSummaryController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('is-used/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PettyCashSummaryController.prototype, "isUsed", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashSummaries.edit'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_petty_cash_summary_dto_1.UpdatePettyCashSummaryDto]),
    __metadata("design:returntype", void 0)
], PettyCashSummaryController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.pettyCashSummaries.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PettyCashSummaryController.prototype, "remove", null);
exports.PettyCashSummaryController = PettyCashSummaryController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('rap/petty-cash-summaries'),
    __metadata("design:paramtypes", [petty_cash_summary_service_1.PettyCashSummaryService])
], PettyCashSummaryController);
//# sourceMappingURL=petty-cash-summary.controller.js.map
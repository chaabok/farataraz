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
exports.NatureAdjustmentController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const nature_adjustment_service_1 = require("../../application/services/nature-adjustment.service");
let NatureAdjustmentController = class NatureAdjustmentController {
    constructor(natureAdjustmentService) {
        this.natureAdjustmentService = natureAdjustmentService;
    }
    async getContraryBalances(fiscalYearId) {
        if (!fiscalYearId) {
            throw new common_1.BadRequestException('fiscalYearId is required');
        }
        const lines = await this.natureAdjustmentService.getContraryBalances(fiscalYearId);
        return { success: true, data: lines };
    }
    async saveAdjustment(payload) {
        const result = await this.natureAdjustmentService.saveAdjustmentVoucher(payload);
        return { success: true, message: 'سند تعدیل ماهیت با موفقیت ثبت شد', data: result };
    }
};
exports.NatureAdjustmentController = NatureAdjustmentController;
__decorate([
    (0, common_1.Get)('contrary-balances'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], NatureAdjustmentController.prototype, "getContraryBalances", null);
__decorate([
    (0, common_1.Post)('save'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NatureAdjustmentController.prototype, "saveAdjustment", null);
exports.NatureAdjustmentController = NatureAdjustmentController = __decorate([
    (0, common_1.Controller)('accounting/nature-adjustment'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [nature_adjustment_service_1.NatureAdjustmentService])
], NatureAdjustmentController);
//# sourceMappingURL=nature-adjustment.controller.js.map
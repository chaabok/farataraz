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
exports.SalesTrackingFactorSettingController = void 0;
const common_1 = require("@nestjs/common");
const sales_tracking_factor_setting_service_1 = require("../../application/services/sales-tracking-factor-setting.service");
const create_sales_tracking_factor_setting_dto_1 = require("../../application/dtos/create-sales-tracking-factor-setting.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let SalesTrackingFactorSettingController = class SalesTrackingFactorSettingController {
    constructor(service) {
        this.service = service;
    }
    async getSettings() {
        const data = await this.service.getSettings();
        return { success: true, data };
    }
    async upsert(dto) {
        const data = await this.service.upsertMany(dto?.settings || []);
        return { success: true, data };
    }
};
exports.SalesTrackingFactorSettingController = SalesTrackingFactorSettingController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesTrackingFactorSettingController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Post)('upsert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_tracking_factor_setting_dto_1.UpsertSalesTrackingFactorSettingsDto]),
    __metadata("design:returntype", Promise)
], SalesTrackingFactorSettingController.prototype, "upsert", null);
exports.SalesTrackingFactorSettingController = SalesTrackingFactorSettingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sle/sales-tracking-factor-settings'),
    __metadata("design:paramtypes", [sales_tracking_factor_setting_service_1.SalesTrackingFactorSettingService])
], SalesTrackingFactorSettingController);
//# sourceMappingURL=sales-tracking-factor-setting.controller.js.map
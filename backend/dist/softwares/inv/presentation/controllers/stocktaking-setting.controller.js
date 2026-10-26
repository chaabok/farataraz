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
exports.StocktakingSettingController = void 0;
const common_1 = require("@nestjs/common");
const stocktaking_setting_service_1 = require("../../application/services/stocktaking-setting.service");
const stocktaking_setting_dto_1 = require("../../application/dtos/stocktaking-setting.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let StocktakingSettingController = class StocktakingSettingController {
    constructor(service) {
        this.service = service;
    }
    getSetting() {
        return this.service.getAllSettings();
    }
    saveSetting(dto) {
        return this.service.saveSetting(dto);
    }
    updateSetting(id, dto) {
        dto.StocktakingSettingID = Number(id);
        return this.service.saveSetting(dto);
    }
    deleteSetting(id) {
        return this.service.deleteSetting(Number(id));
    }
};
exports.StocktakingSettingController = StocktakingSettingController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('Warehouse:Read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StocktakingSettingController.prototype, "getSetting", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('Warehouse:Update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stocktaking_setting_dto_1.CreateStocktakingSettingDto]),
    __metadata("design:returntype", void 0)
], StocktakingSettingController.prototype, "saveSetting", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('Warehouse:Update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, stocktaking_setting_dto_1.CreateStocktakingSettingDto]),
    __metadata("design:returntype", void 0)
], StocktakingSettingController.prototype, "updateSetting", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('Warehouse:Delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StocktakingSettingController.prototype, "deleteSetting", null);
exports.StocktakingSettingController = StocktakingSettingController = __decorate([
    (0, common_1.Controller)('inv/stocktaking-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [stocktaking_setting_service_1.StocktakingSettingService])
], StocktakingSettingController);
//# sourceMappingURL=stocktaking-setting.controller.js.map
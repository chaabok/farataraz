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
exports.BaseSettingsController = void 0;
const common_1 = require("@nestjs/common");
const base_settings_service_1 = require("../../application/services/base-settings.service");
const business_structure_service_1 = require("../../application/services/business-structure.service");
const update_base_settings_dto_1 = require("../../application/dtos/update-base-settings.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let BaseSettingsController = class BaseSettingsController {
    constructor(baseSettingsService, businessStructureService) {
        this.baseSettingsService = baseSettingsService;
        this.businessStructureService = businessStructureService;
    }
    async getSettings(tabRef, companyId, branchId, agencyId) {
        const compId = companyId ? parseInt(companyId, 10) : 1;
        const brId = branchId ? parseInt(branchId, 10) : undefined;
        const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
        const settings = await this.baseSettingsService.getSettingsByTab(tabRef, compId, brId, agnId);
        return { data: settings };
    }
    async updateSettings(tabRef, dto, companyId, branchId, agencyId) {
        const compId = companyId ? parseInt(companyId, 10) : 1;
        const brId = branchId ? parseInt(branchId, 10) : undefined;
        const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
        await this.baseSettingsService.saveSettings(tabRef, dto, compId, brId, agnId);
        if (tabRef === 1 && dto.settings) {
            const shareSetting = dto.settings.find(s => s.key.trim() === 'shareHeadquarterData');
            if (shareSetting) {
                const isShared = shareSetting.value === 'true' || shareSetting.value === '1';
                try {
                    await this.businessStructureService.updateAllSharing(isShared);
                }
                catch (e) {
                    console.error('Error updating sharing from BaseSettingsController:', e);
                }
            }
        }
        return { message: 'Settings saved successfully' };
    }
};
exports.BaseSettingsController = BaseSettingsController;
__decorate([
    (0, common_1.Get)('tab/:tabRef'),
    (0, permissions_decorator_1.Permissions)('BaseSettings:Read'),
    __param(0, (0, common_1.Param)('tabRef', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('x-branch-id')),
    __param(3, (0, common_1.Headers)('x-agency-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String]),
    __metadata("design:returntype", Promise)
], BaseSettingsController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('tab/:tabRef'),
    (0, permissions_decorator_1.Permissions)('BaseSettings:Update'),
    __param(0, (0, common_1.Param)('tabRef', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('x-branch-id')),
    __param(4, (0, common_1.Headers)('x-agency-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_base_settings_dto_1.UpdateBaseSettingsDto, String, String, String]),
    __metadata("design:returntype", Promise)
], BaseSettingsController.prototype, "updateSettings", null);
exports.BaseSettingsController = BaseSettingsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('common/base-settings'),
    __metadata("design:paramtypes", [base_settings_service_1.BaseSettingsService,
        business_structure_service_1.BusinessStructureService])
], BaseSettingsController);
//# sourceMappingURL=base-settings.controller.js.map
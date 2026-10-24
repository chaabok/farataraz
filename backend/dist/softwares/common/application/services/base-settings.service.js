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
exports.BaseSettingsService = void 0;
const common_1 = require("@nestjs/common");
let BaseSettingsService = class BaseSettingsService {
    constructor(baseSettingsRepository) {
        this.baseSettingsRepository = baseSettingsRepository;
    }
    async getSettingsByTab(tabRef, companyId = 2, branchId, agencyId) {
        const settings = await this.baseSettingsRepository.findByTabRef(tabRef, companyId, branchId, agencyId);
        const result = {};
        settings.forEach((s) => {
            result[s.key.trim()] = s.value;
        });
        if (tabRef === 1) {
            try {
                const holdingSettings = await this.baseSettingsRepository.findByTabRef(7, companyId, branchId, agencyId);
                holdingSettings.forEach((s) => {
                    const key = s.key.trim();
                    if (result[key] === undefined) {
                        result[key] = s.value;
                    }
                });
            }
            catch (e) {
                console.error('Error fetching tab 7 settings inside tab 1 merger:', e);
            }
        }
        return result;
    }
    async saveSettings(tabRef, dto, companyId = 2, branchId, agencyId) {
        await this.baseSettingsRepository.saveSettings(tabRef, dto.settings, companyId, branchId, agencyId);
        if (tabRef === 1 && dto.settings) {
            const holdingKeys = ['shareHeadquarterData', 'activeBusinessStructures'];
            const holdingSettings = dto.settings.filter(s => holdingKeys.includes(s.key.trim()));
            if (holdingSettings.length > 0) {
                await this.baseSettingsRepository.saveSettings(7, holdingSettings, companyId, branchId, agencyId);
            }
        }
    }
};
exports.BaseSettingsService = BaseSettingsService;
exports.BaseSettingsService = BaseSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IBaseSettingsRepository')),
    __metadata("design:paramtypes", [Object])
], BaseSettingsService);
//# sourceMappingURL=base-settings.service.js.map
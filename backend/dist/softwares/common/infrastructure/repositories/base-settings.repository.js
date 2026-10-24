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
exports.BaseSettingsRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const base_settings_entity_1 = require("../../domain/entities/base-settings.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let BaseSettingsRepository = class BaseSettingsRepository {
    constructor(repository, idGenerationService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
    }
    async findByTabRef(tabRef, companyId = 2, branchId, agencyId) {
        const where = { tabRef, businessStructureRef: companyId, companyRef: companyId };
        where.branchRef = branchId === undefined ? (0, typeorm_2.IsNull)() : branchId;
        where.agencyRef = agencyId === undefined ? (0, typeorm_2.IsNull)() : agencyId;
        return this.repository.find({ where });
    }
    async saveSetting(tabRef, key, value, companyId = 2, branchId, agencyId) {
        const where = { tabRef, key, businessStructureRef: companyId, companyRef: companyId };
        where.branchRef = branchId === undefined ? (0, typeorm_2.IsNull)() : branchId;
        where.agencyRef = agencyId === undefined ? (0, typeorm_2.IsNull)() : agencyId;
        let setting = await this.repository.findOne({ where });
        const strVal = value !== undefined && value !== null ? String(value) : '';
        if (setting) {
            setting.value = strVal;
        }
        else {
            const id = await this.idGenerationService.generateNextId('BaseSettings');
            const createData = { baseSettingsID: id, tabRef, key, value: strVal, businessStructureRef: companyId, companyRef: companyId };
            createData.branchRef = branchId === undefined ? null : branchId;
            createData.agencyRef = agencyId === undefined ? null : agencyId;
            setting = this.repository.create(createData);
        }
        return this.repository.save(setting);
    }
    async saveSettings(tabRef, settings, companyId = 2, branchId, agencyId) {
        const where = { tabRef, businessStructureRef: companyId, companyRef: companyId };
        where.branchRef = branchId === undefined ? (0, typeorm_2.IsNull)() : branchId;
        where.agencyRef = agencyId === undefined ? (0, typeorm_2.IsNull)() : agencyId;
        const existingSettings = await this.repository.find({ where });
        const entitiesToSave = [];
        for (const settingData of settings) {
            const strKey = String(settingData.key || '').trim();
            if (!strKey)
                continue;
            const strVal = settingData.value !== undefined && settingData.value !== null ? String(settingData.value) : '';
            const existing = existingSettings.find(s => s.key.trim() === strKey);
            if (existing) {
                existing.value = strVal;
                if (!entitiesToSave.includes(existing)) {
                    entitiesToSave.push(existing);
                }
            }
            else {
                const id = await this.idGenerationService.generateNextId('BaseSettings');
                const createData = {
                    baseSettingsID: id,
                    tabRef,
                    key: strKey,
                    value: strVal,
                    businessStructureRef: companyId,
                    companyRef: companyId,
                };
                createData.branchRef = branchId === undefined ? null : branchId;
                createData.agencyRef = agencyId === undefined ? null : agencyId;
                const newSetting = this.repository.create(createData);
                existingSettings.push(newSetting);
                entitiesToSave.push(newSetting);
            }
        }
        if (entitiesToSave.length > 0) {
            await this.repository.save(entitiesToSave);
        }
    }
};
exports.BaseSettingsRepository = BaseSettingsRepository;
exports.BaseSettingsRepository = BaseSettingsRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(base_settings_entity_1.BaseSettings)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        id_generation_service_1.IdGenerationService])
], BaseSettingsRepository);
//# sourceMappingURL=base-settings.repository.js.map
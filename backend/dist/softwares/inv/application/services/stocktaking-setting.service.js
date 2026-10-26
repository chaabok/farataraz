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
exports.StocktakingSettingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stocktaking_setting_entity_1 = require("../../domain/entities/stocktaking-setting.entity");
const stocktaking_setting_warehouse_entity_1 = require("../../domain/entities/stocktaking-setting-warehouse.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let StocktakingSettingService = class StocktakingSettingService {
    constructor(settingRepo, settingWarehouseRepo, idGenerationService, requestContextService) {
        this.settingRepo = settingRepo;
        this.settingWarehouseRepo = settingWarehouseRepo;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        return { bsId, compId };
    }
    async getAllSettings() {
        const { bsId, compId } = await this.getScope();
        let settings = await this.settingRepo.find({
            where: {
                companyRef: compId,
                businessStructureRef: bsId,
            },
            relations: ['warehouses'],
            order: { StocktakingSettingID: 'DESC' },
        });
        if (!settings || settings.length === 0) {
            const current = await this.getCurrentSetting();
            if (current) {
                settings = [current];
            }
        }
        return (settings || []).map((s) => ({
            ...s,
            id: s.StocktakingSettingID,
            code: s.StocktakingSettingID,
            title: s.MethodName,
        }));
    }
    async getCurrentSetting() {
        const { bsId, compId } = await this.getScope();
        let setting = await this.settingRepo.findOne({
            where: {
                companyRef: compId,
                businessStructureRef: bsId,
            },
            relations: ['warehouses'],
            order: { StocktakingSettingID: 'DESC' },
        });
        if (!setting) {
            const settingId = await this.idGenerationService.generateNextIdBlock('StocktakingSetting', 1);
            setting = this.settingRepo.create({
                StocktakingSettingID: settingId,
                MethodName: 'روش انبارگردانی',
                CountTimes: 1,
                CountWithTrackingFactors: false,
                Count1MinQty: 0,
                Count1MinRial: 0,
                Count1MinTurnover: 0,
                Count2ListType: 'all_first',
                Count2DiscrepancyPercent: 0,
                Count3CombineType: 'OR',
                Count3DiscrepancyPercent: 0,
                Count3Discrepancy1And2: false,
                Count3Discrepancy1AndInv: false,
                Count3Discrepancy2AndInv: false,
                businessStructureRef: bsId,
                companyRef: compId,
                warehouses: [],
            });
            await this.settingRepo.save(setting);
        }
        return {
            ...setting,
            id: setting.StocktakingSettingID,
            code: setting.StocktakingSettingID,
            title: setting.MethodName,
        };
    }
    async saveSetting(dto) {
        if (!dto.MethodName || !dto.MethodName.trim()) {
            throw new common_1.BadRequestException('عنوان روش انبارگردانی الزامی است.');
        }
        if (!dto.warehouseIds || !Array.isArray(dto.warehouseIds) || dto.warehouseIds.length === 0) {
            throw new common_1.BadRequestException('انتخاب حداقل یک انبار برای روش انبارگردانی الزامی است.');
        }
        const { bsId, compId } = await this.getScope();
        let existing = null;
        if (dto.StocktakingSettingID) {
            existing = await this.settingRepo.findOne({
                where: { StocktakingSettingID: dto.StocktakingSettingID },
                relations: ['warehouses'],
            });
        }
        let settingId;
        if (!existing) {
            settingId = await this.idGenerationService.generateNextIdBlock('StocktakingSetting', 1);
            existing = this.settingRepo.create({
                StocktakingSettingID: settingId,
                businessStructureRef: bsId,
                companyRef: compId,
            });
        }
        else {
            settingId = Number(existing.StocktakingSettingID);
        }
        existing.MethodName = dto.MethodName || 'روش انبارگردانی';
        existing.CountTimes = Number(dto.CountTimes || 1);
        existing.CountWithTrackingFactors = Boolean(dto.CountWithTrackingFactors);
        existing.Count1MinQty = Number(dto.Count1MinQty || 0);
        existing.Count1MinRial = Number(dto.Count1MinRial || 0);
        existing.Count1MinTurnover = Number(dto.Count1MinTurnover || 0);
        existing.Count2ListType = dto.Count2ListType || 'all_first';
        existing.Count2DiscrepancyPercent = Number(dto.Count2DiscrepancyPercent || 0);
        existing.Count3CombineType = dto.Count3CombineType || 'OR';
        existing.Count3DiscrepancyPercent = Number(dto.Count3DiscrepancyPercent || 0);
        existing.Count3Discrepancy1And2 = Boolean(dto.Count3Discrepancy1And2);
        existing.Count3Discrepancy1AndInv = Boolean(dto.Count3Discrepancy1AndInv);
        existing.Count3Discrepancy2AndInv = Boolean(dto.Count3Discrepancy2AndInv);
        existing.lastModifier = this.requestContextService.getUserId() || 1;
        const savedSetting = await this.settingRepo.save(existing);
        if (dto.warehouseIds && Array.isArray(dto.warehouseIds)) {
            await this.settingWarehouseRepo.delete({ StocktakingSettingRef: settingId });
            if (dto.warehouseIds.length > 0) {
                const startWhId = await this.idGenerationService.generateNextIdBlock('StocktakingSettingWarehouse', dto.warehouseIds.length);
                const whRecords = dto.warehouseIds.map((wId, idx) => this.settingWarehouseRepo.create({
                    StocktakingSettingWarehouseID: startWhId + idx,
                    StocktakingSettingRef: settingId,
                    WarehouseRef: Number(wId),
                }));
                await this.settingWarehouseRepo.save(whRecords);
            }
        }
        return this.settingRepo.findOne({
            where: { StocktakingSettingID: settingId },
            relations: ['warehouses'],
        });
    }
    async deleteSetting(id) {
        if (id && Number(id) > 0) {
            await this.settingWarehouseRepo.delete({ StocktakingSettingRef: Number(id) });
            await this.settingRepo.delete({ StocktakingSettingID: Number(id) });
        }
        return { success: true };
    }
};
exports.StocktakingSettingService = StocktakingSettingService;
exports.StocktakingSettingService = StocktakingSettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stocktaking_setting_entity_1.StocktakingSetting)),
    __param(1, (0, typeorm_1.InjectRepository)(stocktaking_setting_warehouse_entity_1.StocktakingSettingWarehouse)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], StocktakingSettingService);
//# sourceMappingURL=stocktaking-setting.service.js.map
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
exports.StocktakingTagController = void 0;
const common_1 = require("@nestjs/common");
const stocktaking_tag_service_1 = require("../../application/services/stocktaking-tag.service");
const stocktaking_tag_dto_1 = require("../../application/dtos/stocktaking-tag.dto");
let StocktakingTagController = class StocktakingTagController {
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        return this.service.findAll();
    }
    async getWarehousesSummary(settingId, headerId) {
        const parsedSetting = settingId ? parseInt(settingId, 10) : 0;
        const sId = !isNaN(parsedSetting) ? parsedSetting : 0;
        const parsedHeader = headerId ? parseInt(headerId, 10) : undefined;
        const hId = parsedHeader && !isNaN(parsedHeader) ? parsedHeader : undefined;
        return this.service.getWarehousesForSetting(sId, hId);
    }
    async getWarehouseItems(warehouseId, settingId, headerId) {
        const parsedWh = warehouseId ? parseInt(warehouseId, 10) : 0;
        const wId = !isNaN(parsedWh) ? parsedWh : 0;
        const parsedSetting = settingId ? parseInt(settingId, 10) : undefined;
        const sId = parsedSetting && !isNaN(parsedSetting) ? parsedSetting : undefined;
        const parsedHeader = headerId ? parseInt(headerId, 10) : undefined;
        const hId = parsedHeader && !isNaN(parsedHeader) ? parsedHeader : undefined;
        return this.service.getWarehouseItems(wId, sId, hId);
    }
    async getNextNumber(fiscalYearId) {
        const fyId = fiscalYearId ? parseInt(fiscalYearId, 10) : undefined;
        return this.service.getNextHeaderNumber(fyId);
    }
    async getLatestDate(fiscalYearId, excludeHeaderId) {
        const parsedFy = fiscalYearId ? parseInt(fiscalYearId, 10) : undefined;
        const fyId = parsedFy && !isNaN(parsedFy) && parsedFy > 0 ? parsedFy : undefined;
        const parsedEx = excludeHeaderId ? parseInt(excludeHeaderId, 10) : undefined;
        const exId = parsedEx && !isNaN(parsedEx) && parsedEx > 0 ? parsedEx : undefined;
        return this.service.getLatestStocktaking(fyId, exId);
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async create(dto) {
        return this.service.create(dto);
    }
    async update(id, dto) {
        return this.service.update(id, dto);
    }
    async deleteWarehouseTagsPost(headerId, warehouseId, itemIdsQuery, itemIdsBody) {
        const hId = parseInt(headerId, 10);
        const wId = parseInt(warehouseId, 10);
        let itemIds = itemIdsBody;
        if ((!itemIds || itemIds.length === 0) && itemIdsQuery) {
            itemIds = itemIdsQuery.split(',').map((id) => parseInt(id.trim(), 10)).filter((n) => !isNaN(n));
        }
        return this.service.deleteWarehouseTags(hId, wId, itemIds);
    }
    async deleteWarehouseTags(headerId, warehouseId, itemIdsQuery, itemIdsBody) {
        const hId = parseInt(headerId, 10);
        const wId = parseInt(warehouseId, 10);
        let itemIds = itemIdsBody;
        if ((!itemIds || itemIds.length === 0) && itemIdsQuery) {
            itemIds = itemIdsQuery.split(',').map((id) => parseInt(id.trim(), 10)).filter((n) => !isNaN(n));
        }
        return this.service.deleteWarehouseTags(hId, wId, itemIds);
    }
    async remove(id) {
        return this.service.remove(id);
    }
};
exports.StocktakingTagController = StocktakingTagController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('warehouses-summary'),
    __param(0, (0, common_1.Query)('settingId')),
    __param(1, (0, common_1.Query)('headerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "getWarehousesSummary", null);
__decorate([
    (0, common_1.Get)('warehouse-items'),
    __param(0, (0, common_1.Query)('warehouseId')),
    __param(1, (0, common_1.Query)('settingId')),
    __param(2, (0, common_1.Query)('headerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "getWarehouseItems", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)('latest-date'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __param(1, (0, common_1.Query)('excludeHeaderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "getLatestDate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stocktaking_tag_dto_1.CreateStocktakingTagHeaderDto]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, stocktaking_tag_dto_1.UpdateStocktakingTagHeaderDto]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('delete-warehouse-tags'),
    __param(0, (0, common_1.Query)('headerId')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('itemIds')),
    __param(3, (0, common_1.Body)('itemIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Array]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "deleteWarehouseTagsPost", null);
__decorate([
    (0, common_1.Delete)('delete-warehouse-tags'),
    __param(0, (0, common_1.Query)('headerId')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('itemIds')),
    __param(3, (0, common_1.Body)('itemIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Array]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "deleteWarehouseTags", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StocktakingTagController.prototype, "remove", null);
exports.StocktakingTagController = StocktakingTagController = __decorate([
    (0, common_1.Controller)('inv/stocktaking-tags'),
    __metadata("design:paramtypes", [stocktaking_tag_service_1.StocktakingTagService])
], StocktakingTagController);
//# sourceMappingURL=stocktaking-tag.controller.js.map
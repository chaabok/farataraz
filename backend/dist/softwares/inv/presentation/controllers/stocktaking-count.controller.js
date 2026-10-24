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
exports.StocktakingCountController = void 0;
const common_1 = require("@nestjs/common");
const stocktaking_count_service_1 = require("../../application/services/stocktaking-count.service");
const stocktaking_count_dto_1 = require("../../application/dtos/stocktaking-count.dto");
let StocktakingCountController = class StocktakingCountController {
    constructor(service) {
        this.service = service;
    }
    async getPeriods(fiscalYearId) {
        const fyId = fiscalYearId ? parseInt(fiscalYearId, 10) : undefined;
        return this.service.getPeriods(fyId);
    }
    async getWarehouses(tagHeaderId, excludeCompleted, currentCountId) {
        const exclude = excludeCompleted === undefined ? true : (excludeCompleted === 'true' || excludeCompleted === '1');
        const countId = currentCountId ? parseInt(currentCountId, 10) : undefined;
        return this.service.getWarehousesForTagHeader(tagHeaderId, exclude, countId);
    }
    async getWarehouseCountInfo(tagHeaderId, warehouseId) {
        return this.service.getWarehouseCountStatus(tagHeaderId, warehouseId);
    }
    async getItems(tagHeaderId, warehouseId, countId, round) {
        const cId = countId ? parseInt(countId, 10) : undefined;
        const rNum = round ? parseInt(round, 10) : undefined;
        return this.service.getItemsForCount(tagHeaderId, warehouseId, cId, rNum);
    }
    async getNextNumber(fiscalYearId, warehouseId) {
        const fyId = fiscalYearId ? parseInt(fiscalYearId, 10) : undefined;
        const whId = warehouseId ? parseInt(warehouseId, 10) : undefined;
        return this.service.getNextNumber(fyId, whId);
    }
    async findAll() {
        return this.service.findAll();
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
    async remove(id) {
        return this.service.remove(id);
    }
};
exports.StocktakingCountController = StocktakingCountController;
__decorate([
    (0, common_1.Get)('periods'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "getPeriods", null);
__decorate([
    (0, common_1.Get)('warehouses'),
    __param(0, (0, common_1.Query)('tagHeaderId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('excludeCompleted')),
    __param(2, (0, common_1.Query)('currentCountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "getWarehouses", null);
__decorate([
    (0, common_1.Get)('warehouse-count-info'),
    __param(0, (0, common_1.Query)('tagHeaderId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('warehouseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "getWarehouseCountInfo", null);
__decorate([
    (0, common_1.Get)('items'),
    __param(0, (0, common_1.Query)('tagHeaderId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('warehouseId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('countId')),
    __param(3, (0, common_1.Query)('round')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "getItems", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stocktaking_count_dto_1.CreateStocktakingCountDto]),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, stocktaking_count_dto_1.UpdateStocktakingCountDto]),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StocktakingCountController.prototype, "remove", null);
exports.StocktakingCountController = StocktakingCountController = __decorate([
    (0, common_1.Controller)('inv/stocktaking-counts'),
    __metadata("design:paramtypes", [stocktaking_count_service_1.StocktakingCountService])
], StocktakingCountController);
//# sourceMappingURL=stocktaking-count.controller.js.map
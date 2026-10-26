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
exports.WarehouseVouchersPricingController = void 0;
const common_1 = require("@nestjs/common");
const warehouse_vouchers_pricing_service_1 = require("../../application/services/warehouse-vouchers-pricing.service");
const warehouse_vouchers_pricing_dto_1 = require("../../application/dtos/warehouse-vouchers-pricing.dto");
let WarehouseVouchersPricingController = class WarehouseVouchersPricingController {
    constructor(service) {
        this.service = service;
    }
    async calculatePricing(dto) {
        const data = await this.service.calculatePricing(dto);
        return { success: true, data };
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { success: true, data };
    }
    async createBatch(dtos) {
        const data = await this.service.createBatch(dtos);
        return { success: true, data };
    }
    async findAll(query) {
        const data = await this.service.findAll(query);
        return { success: true, data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { success: true, data };
    }
    async update(id, dto) {
        const data = await this.service.update(id, dto);
        return { success: true, data };
    }
    async remove(id) {
        await this.service.remove(id);
        return { success: true, message: 'رکورد قیمت‌گذاری اسناد انبار با موفقیت حذف شد' };
    }
};
exports.WarehouseVouchersPricingController = WarehouseVouchersPricingController;
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouse_vouchers_pricing_dto_1.CalculateWarehousePricingDto]),
    __metadata("design:returntype", Promise)
], WarehouseVouchersPricingController.prototype, "calculatePricing", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouse_vouchers_pricing_dto_1.CreateWarehouseVouchersPricingDto]),
    __metadata("design:returntype", Promise)
], WarehouseVouchersPricingController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('batch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], WarehouseVouchersPricingController.prototype, "createBatch", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WarehouseVouchersPricingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WarehouseVouchersPricingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, warehouse_vouchers_pricing_dto_1.UpdateWarehouseVouchersPricingDto]),
    __metadata("design:returntype", Promise)
], WarehouseVouchersPricingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], WarehouseVouchersPricingController.prototype, "remove", null);
exports.WarehouseVouchersPricingController = WarehouseVouchersPricingController = __decorate([
    (0, common_1.Controller)('inv/warehouse-vouchers-pricing'),
    __metadata("design:paramtypes", [warehouse_vouchers_pricing_service_1.WarehouseVouchersPricingService])
], WarehouseVouchersPricingController);
//# sourceMappingURL=warehouse-vouchers-pricing.controller.js.map
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
exports.SalesChannelController = void 0;
const common_1 = require("@nestjs/common");
const sales_channel_service_1 = require("../../application/services/sales-channel.service");
const create_sales_channel_dto_1 = require("../../application/dtos/create-sales-channel.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let SalesChannelController = class SalesChannelController {
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        const data = await this.service.findAll();
        return { data, success: true };
    }
    async getNextNumber() {
        const data = await this.service.getNextNumber();
        return { data, success: true };
    }
    async checkDuplicate(field, value, excludeId) {
        const isDuplicate = await this.service.checkDuplicate(field, value, excludeId ? Number(excludeId) : undefined);
        return { data: { isDuplicate }, success: true };
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { data, success: true, message: 'کانال فروش با موفقیت ایجاد شد' };
    }
    async update(id, dto) {
        const data = await this.service.update(+id, dto);
        return { data, success: true, message: 'کانال فروش با موفقیت به‌روزرسانی شد' };
    }
    async findOne(id) {
        const data = await this.service.findById(+id);
        return { data, success: true };
    }
    async remove(id) {
        await this.service.remove(+id);
        return { success: true, message: 'کانال فروش با موفقیت حذف شد' };
    }
};
exports.SalesChannelController = SalesChannelController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesChannelController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesChannelController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)('check-duplicate'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesChannelController.prototype, "checkDuplicate", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_channel_dto_1.CreateSalesChannelDto]),
    __metadata("design:returntype", Promise)
], SalesChannelController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_sales_channel_dto_1.UpdateSalesChannelDto]),
    __metadata("design:returntype", Promise)
], SalesChannelController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesChannelController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesChannelController.prototype, "remove", null);
exports.SalesChannelController = SalesChannelController = __decorate([
    (0, common_1.Controller)('sle/sales-channels'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [sales_channel_service_1.SalesChannelService])
], SalesChannelController);
//# sourceMappingURL=sales-channel.controller.js.map
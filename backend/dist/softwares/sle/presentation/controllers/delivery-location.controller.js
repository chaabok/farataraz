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
exports.DeliveryLocationController = void 0;
const common_1 = require("@nestjs/common");
const delivery_location_service_1 = require("../../application/services/delivery-location.service");
const create_delivery_location_dto_1 = require("../../application/dtos/create-delivery-location.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let DeliveryLocationController = class DeliveryLocationController {
    constructor(service) {
        this.service = service;
    }
    async findAll(activeOnly) {
        const data = await this.service.findAll(activeOnly === 'true' || activeOnly === '1');
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
        return { data, success: true, message: 'مکان تحویل با موفقیت ایجاد شد' };
    }
    async update(id, dto) {
        const data = await this.service.update(+id, dto);
        return { data, success: true, message: 'مکان تحویل با موفقیت به‌روزرسانی شد' };
    }
    async findOne(id) {
        const data = await this.service.findById(+id);
        return { data, success: true };
    }
    async remove(id) {
        await this.service.remove(+id);
        return { success: true, message: 'مکان تحویل با موفقیت حذف شد' };
    }
};
exports.DeliveryLocationController = DeliveryLocationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryLocationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeliveryLocationController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)('check-duplicate'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DeliveryLocationController.prototype, "checkDuplicate", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_delivery_location_dto_1.CreateDeliveryLocationDto]),
    __metadata("design:returntype", Promise)
], DeliveryLocationController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_delivery_location_dto_1.UpdateDeliveryLocationDto]),
    __metadata("design:returntype", Promise)
], DeliveryLocationController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryLocationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DeliveryLocationController.prototype, "remove", null);
exports.DeliveryLocationController = DeliveryLocationController = __decorate([
    (0, common_1.Controller)('sle/delivery-locations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [delivery_location_service_1.DeliveryLocationService])
], DeliveryLocationController);
//# sourceMappingURL=delivery-location.controller.js.map
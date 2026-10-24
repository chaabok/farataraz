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
exports.SalesTypeController = void 0;
const common_1 = require("@nestjs/common");
const sales_type_service_1 = require("../../application/services/sales-type.service");
const create_sales_type_dto_1 = require("../../application/dtos/create-sales-type.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let SalesTypeController = class SalesTypeController {
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        const data = await this.service.findAll();
        return { success: true, data };
    }
    async getNextCode() {
        const data = await this.service.getNextCode();
        return { success: true, data: data.code };
    }
    async checkDuplicate(field, value, excludeId) {
        const isDuplicate = await this.service.checkDuplicate(field, value, excludeId ? Number(excludeId) : undefined);
        return { success: true, data: { isDuplicate } };
    }
    async findById(id) {
        const data = await this.service.findById(Number(id));
        return { success: true, data };
    }
    async upsert(dto) {
        if (dto.SalesTypeID) {
            const data = await this.service.update(dto.SalesTypeID, dto);
            return { success: true, data };
        }
        else {
            const data = await this.service.create(dto);
            return { success: true, data };
        }
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { success: true, data };
    }
    async update(id, dto) {
        const data = await this.service.update(Number(id), dto);
        return { success: true, data };
    }
    async remove(id) {
        await this.service.remove(Number(id));
        return { success: true, message: 'Deleted successfully' };
    }
};
exports.SalesTypeController = SalesTypeController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesTypeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-code'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesTypeController.prototype, "getNextCode", null);
__decorate([
    (0, common_1.Get)('check-duplicate'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SalesTypeController.prototype, "checkDuplicate", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesTypeController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)('upsert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SalesTypeController.prototype, "upsert", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_type_dto_1.CreateSalesTypeDto]),
    __metadata("design:returntype", Promise)
], SalesTypeController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_sales_type_dto_1.UpdateSalesTypeDto]),
    __metadata("design:returntype", Promise)
], SalesTypeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesTypeController.prototype, "remove", null);
exports.SalesTypeController = SalesTypeController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sle/sales-types'),
    __metadata("design:paramtypes", [sales_type_service_1.SalesTypeService])
], SalesTypeController);
//# sourceMappingURL=sales-type.controller.js.map
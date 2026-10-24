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
exports.SalesDocumentSettingsController = void 0;
const common_1 = require("@nestjs/common");
const sales_document_settings_service_1 = require("../../application/services/sales-document-settings.service");
const create_sales_document_settings_dto_1 = require("../../application/dtos/create-sales-document-settings.dto");
const sales_document_type_enum_1 = require("../../domain/entities/sales-document-type.enum");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let SalesDocumentSettingsController = class SalesDocumentSettingsController {
    constructor(service) {
        this.service = service;
    }
    getDocumentTypes() {
        return { success: true, data: this.service.getDocumentTypes() };
    }
    async findByType(type) {
        const data = await this.service.findByType(Number(type));
        return { success: true, data };
    }
    async findAll() {
        const data = await this.service.findAll();
        const mapped = data.map((item) => ({
            ...item,
            SalesDocumentTypeName: (0, sales_document_type_enum_1.salesDocumentTypeLabel)(item.SalesDocumentType),
        }));
        return { success: true, data: mapped };
    }
    async findById(id) {
        const data = await this.service.findById(Number(id));
        return { success: true, data };
    }
    async upsert(dto) {
        const data = await this.service.upsert(dto);
        return { success: true, data };
    }
    async create(dto) {
        const data = await this.service.upsert(dto);
        return { success: true, data };
    }
    async update(id, dto) {
        const data = await this.service.upsert(dto);
        return { success: true, data };
    }
    async remove(id) {
        await this.service.remove(Number(id));
        return { success: true, message: 'Deleted successfully' };
    }
};
exports.SalesDocumentSettingsController = SalesDocumentSettingsController;
__decorate([
    (0, common_1.Get)('document-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SalesDocumentSettingsController.prototype, "getDocumentTypes", null);
__decorate([
    (0, common_1.Get)('by-type/:type'),
    __param(0, (0, common_1.Param)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesDocumentSettingsController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SalesDocumentSettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesDocumentSettingsController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)('upsert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_document_settings_dto_1.CreateSalesDocumentSettingsDto]),
    __metadata("design:returntype", Promise)
], SalesDocumentSettingsController.prototype, "upsert", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sales_document_settings_dto_1.CreateSalesDocumentSettingsDto]),
    __metadata("design:returntype", Promise)
], SalesDocumentSettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_sales_document_settings_dto_1.UpdateSalesDocumentSettingsDto]),
    __metadata("design:returntype", Promise)
], SalesDocumentSettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesDocumentSettingsController.prototype, "remove", null);
exports.SalesDocumentSettingsController = SalesDocumentSettingsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sle/sales-document-settings'),
    __metadata("design:paramtypes", [sales_document_settings_service_1.SalesDocumentSettingsService])
], SalesDocumentSettingsController);
//# sourceMappingURL=sales-document-settings.controller.js.map
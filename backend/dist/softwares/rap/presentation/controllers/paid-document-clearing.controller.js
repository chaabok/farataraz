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
exports.PaidDocumentClearingController = void 0;
const common_1 = require("@nestjs/common");
const paid_document_clearing_service_1 = require("../../application/services/paid-document-clearing.service");
const create_paid_document_clearing_dto_1 = require("../../application/dtos/create-paid-document-clearing.dto");
const update_paid_document_clearing_dto_1 = require("../../application/dtos/update-paid-document-clearing.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let PaidDocumentClearingController = class PaidDocumentClearingController {
    constructor(service) {
        this.service = service;
    }
    async getNextNumbers(date) {
        return await this.service.getNextNumbers(date);
    }
    async create(dto) {
        const result = await this.service.create(dto);
        return { data: result };
    }
    async update(id, dto) {
        const result = await this.service.update(parseInt(id, 10), dto);
        return { data: result };
    }
    async delete(id) {
        await this.service.delete(parseInt(id, 10));
        return { success: true };
    }
    async findById(id) {
        const result = await this.service.findById(parseInt(id, 10));
        return { data: result };
    }
    async findAll(query) {
        const filters = {
            ...query,
            skip: query.skip ? parseInt(query.skip, 10) : undefined,
            take: query.take ? parseInt(query.take, 10) : undefined,
        };
        const [data, total] = await this.service.findAll(filters);
        return { data, total };
    }
};
exports.PaidDocumentClearingController = PaidDocumentClearingController;
__decorate([
    (0, common_1.Get)('next-numbers'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaidDocumentClearingController.prototype, "getNextNumbers", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_paid_document_clearing_dto_1.CreatePaidDocumentClearingDto]),
    __metadata("design:returntype", Promise)
], PaidDocumentClearingController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_paid_document_clearing_dto_1.UpdatePaidDocumentClearingDto]),
    __metadata("design:returntype", Promise)
], PaidDocumentClearingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaidDocumentClearingController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaidDocumentClearingController.prototype, "findById", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaidDocumentClearingController.prototype, "findAll", null);
exports.PaidDocumentClearingController = PaidDocumentClearingController = __decorate([
    (0, common_1.Controller)('rap/paid-document-clearings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [paid_document_clearing_service_1.PaidDocumentClearingService])
], PaidDocumentClearingController);
//# sourceMappingURL=paid-document-clearing.controller.js.map
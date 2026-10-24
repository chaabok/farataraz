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
exports.TemporaryItemReceiptController = void 0;
const common_1 = require("@nestjs/common");
const temporary_item_receipt_service_1 = require("../../application/services/temporary-item-receipt.service");
const temporary_item_receipt_dto_1 = require("../../application/dtos/temporary-item-receipt.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let TemporaryItemReceiptController = class TemporaryItemReceiptController {
    constructor(service) {
        this.service = service;
    }
    create(req, createDto) {
        const isReturn = req?.originalUrl?.includes('return-temporary-item-receipts');
        if (!createDto.Type) {
            createDto.Type = isReturn ? 2 : 1;
        }
        return this.service.create(createDto);
    }
    findAll(req, query) {
        const isReturn = req?.originalUrl?.includes('return-temporary-item-receipts');
        if (!query?.type && !query?.Type) {
            query = { ...query, type: isReturn ? 2 : 1 };
        }
        return this.service.findAll(query);
    }
    async getNextNumber(req, type) {
        const isReturn = req?.originalUrl?.includes('return-temporary-item-receipts');
        const docType = type ? Number(type) : (isReturn ? 2 : 1);
        return this.service.getNextNumber(docType);
    }
    findOne(id) {
        const numId = Number(id);
        if (isNaN(numId)) {
            throw new common_1.NotFoundException(`شناسه ${id} نامعتبر است`);
        }
        return this.service.findOne(numId);
    }
    update(req, id, updateDto) {
        const isReturn = req?.originalUrl?.includes('return-temporary-item-receipts');
        if (!updateDto.Type) {
            updateDto.Type = isReturn ? 2 : 1;
        }
        return this.service.update(+id, updateDto);
    }
    remove(id) {
        return this.service.remove(+id);
    }
};
exports.TemporaryItemReceiptController = TemporaryItemReceiptController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, temporary_item_receipt_dto_1.CreateTemporaryItemReceiptDto]),
    __metadata("design:returntype", void 0)
], TemporaryItemReceiptController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TemporaryItemReceiptController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TemporaryItemReceiptController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TemporaryItemReceiptController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, temporary_item_receipt_dto_1.UpdateTemporaryItemReceiptDto]),
    __metadata("design:returntype", void 0)
], TemporaryItemReceiptController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TemporaryItemReceiptController.prototype, "remove", null);
exports.TemporaryItemReceiptController = TemporaryItemReceiptController = __decorate([
    (0, common_1.Controller)(['inv/temporary-item-receipts', 'inv/return-temporary-item-receipts']),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [temporary_item_receipt_service_1.TemporaryItemReceiptService])
], TemporaryItemReceiptController);
//# sourceMappingURL=temporary-item-receipt.controller.js.map
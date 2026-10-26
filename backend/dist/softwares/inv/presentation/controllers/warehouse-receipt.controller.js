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
exports.WarehouseReceiptController = void 0;
const common_1 = require("@nestjs/common");
const warehouse_receipt_service_1 = require("../../application/services/warehouse-receipt.service");
const warehouse_receipt_dto_1 = require("../../application/dtos/warehouse-receipt.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let WarehouseReceiptController = class WarehouseReceiptController {
    constructor(service) {
        this.service = service;
    }
    priceItems(dto) {
        return this.service.priceReceiptItems(dto);
    }
    create(createDto) {
        return this.service.create(createDto);
    }
    findAll(query, req) {
        let nature = query?.nature;
        if (!nature && req) {
            const url = req.originalUrl || req.url || '';
            if (url.includes('warehouse-issues') || url.includes('warehouse-issue')) {
                nature = 2;
            }
            else if (url.includes('warehouse-receipts') || url.includes('warehouse-receipt')) {
                nature = 1;
            }
        }
        return this.service.findAll({ ...query, nature });
    }
    async getNextNumber() {
        return this.service.getNextNumber();
    }
    getRegisteredTrackingFactors(itemRef, warehouseRef, itemCode) {
        return this.service.getRegisteredTrackingFactors(itemRef ? Number(itemRef) : undefined, warehouseRef ? Number(warehouseRef) : undefined, itemCode);
    }
    findOne(id) {
        const numId = Number(id);
        if (isNaN(numId)) {
            throw new common_1.NotFoundException(`شناسه ${id} نامعتبر است`);
        }
        return this.service.findOne(numId);
    }
    update(id, updateDto) {
        return this.service.update(+id, updateDto);
    }
    remove(id) {
        return this.service.remove(+id);
    }
};
exports.WarehouseReceiptController = WarehouseReceiptController;
__decorate([
    (0, common_1.Post)('price-items'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouse_receipt_dto_1.PriceReceiptItemsDto]),
    __metadata("design:returntype", void 0)
], WarehouseReceiptController.prototype, "priceItems", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouse_receipt_dto_1.CreateWarehouseReceiptDto]),
    __metadata("design:returntype", void 0)
], WarehouseReceiptController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WarehouseReceiptController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WarehouseReceiptController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)('registered-tracking-factors'),
    __param(0, (0, common_1.Query)('itemRef')),
    __param(1, (0, common_1.Query)('warehouseRef')),
    __param(2, (0, common_1.Query)('itemCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WarehouseReceiptController.prototype, "getRegisteredTrackingFactors", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehouseReceiptController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, warehouse_receipt_dto_1.UpdateWarehouseReceiptDto]),
    __metadata("design:returntype", void 0)
], WarehouseReceiptController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WarehouseReceiptController.prototype, "remove", null);
exports.WarehouseReceiptController = WarehouseReceiptController = __decorate([
    (0, common_1.Controller)(['inv/warehouse-receipts', 'inv/warehouse-receipt', 'inv/warehouse-issues', 'inv/warehouse-issue']),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [warehouse_receipt_service_1.WarehouseReceiptService])
], WarehouseReceiptController);
//# sourceMappingURL=warehouse-receipt.controller.js.map
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
exports.ItemController = void 0;
const common_1 = require("@nestjs/common");
const item_service_1 = require("../../application/services/item.service");
const create_item_dto_1 = require("../../application/dtos/create-item.dto");
const update_item_dto_1 = require("../../application/dtos/update-item.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let ItemController = class ItemController {
    constructor(service) {
        this.service = service;
    }
    create(createDto) {
        return this.service.create(createDto);
    }
    findAll(query) {
        return this.service.findAll(query);
    }
    async getDropdownItems(type, warehouseId, onlyActive) {
        return this.service.getDropdownItems(type, warehouseId, onlyActive);
    }
    async getNextNumber() {
        return this.service.getNextNumber();
    }
    async getKardexActiveItems(warehouseId, fromDate, toDate, fiscalYearId, companyId) {
        return this.service.getKardexActiveItems(warehouseId, fromDate, toDate, fiscalYearId, companyId);
    }
    async getKardexWarehouses(fiscalYearId, companyId) {
        return this.service.getKardexWarehouses(fiscalYearId, companyId);
    }
    async getKardexDateBounds(fiscalYearId, companyId) {
        return this.service.getKardexDateBounds(fiscalYearId, companyId);
    }
    async getStockSummary(id, warehouseId, excludeVoucherId, partyId, currentDate, docType) {
        return this.service.getStockSummary(+id, warehouseId ? +warehouseId : undefined, excludeVoucherId ? +excludeVoucherId : undefined, partyId, currentDate, docType);
    }
    async getItemKardex(id, warehouseId, fromDate, toDate) {
        return this.service.getItemKardex(+id, warehouseId, fromDate, toDate);
    }
    async getItemTrackingFactorMovements(id, warehouseId, fromDate, toDate) {
        return this.service.getItemTrackingFactorMovements(+id, warehouseId, fromDate, toDate);
    }
    getSubUnits(id) {
        return this.service.getSubUnits(+id);
    }
    findOne(id) {
        return this.service.findOne(+id);
    }
    update(id, updateDto) {
        return this.service.update(+id, updateDto);
    }
    remove(id) {
        return this.service.remove(+id);
    }
};
exports.ItemController = ItemController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_item_dto_1.CreateItemDto]),
    __metadata("design:returntype", void 0)
], ItemController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ItemController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dropdown'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('onlyActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ItemController.prototype, "getDropdownItems", null);
__decorate([
    (0, common_1.Get)('next-number'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ItemController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)('kardex-active-items'),
    __param(0, (0, common_1.Query)('warehouseId')),
    __param(1, (0, common_1.Query)('fromDate')),
    __param(2, (0, common_1.Query)('toDate')),
    __param(3, (0, common_1.Query)('fiscalYearId')),
    __param(4, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ItemController.prototype, "getKardexActiveItems", null);
__decorate([
    (0, common_1.Get)('kardex-warehouses'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ItemController.prototype, "getKardexWarehouses", null);
__decorate([
    (0, common_1.Get)('kardex-date-bounds'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ItemController.prototype, "getKardexDateBounds", null);
__decorate([
    (0, common_1.Get)(':id/stock-summary'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('excludeVoucherId')),
    __param(3, (0, common_1.Query)('partyId')),
    __param(4, (0, common_1.Query)('currentDate')),
    __param(5, (0, common_1.Query)('docType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ItemController.prototype, "getStockSummary", null);
__decorate([
    (0, common_1.Get)(':id/kardex'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ItemController.prototype, "getItemKardex", null);
__decorate([
    (0, common_1.Get)(':id/tracking-factor-movements'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('warehouseId')),
    __param(2, (0, common_1.Query)('fromDate')),
    __param(3, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ItemController.prototype, "getItemTrackingFactorMovements", null);
__decorate([
    (0, common_1.Get)(':id/sub-units'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemController.prototype, "getSubUnits", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_item_dto_1.UpdateItemDto]),
    __metadata("design:returntype", void 0)
], ItemController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItemController.prototype, "remove", null);
exports.ItemController = ItemController = __decorate([
    (0, common_1.Controller)('inv/items'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [item_service_1.ItemService])
], ItemController);
//# sourceMappingURL=item.controller.js.map
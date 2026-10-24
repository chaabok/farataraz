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
exports.WarehouseController = void 0;
const common_1 = require("@nestjs/common");
const warehouse_service_1 = require("../../application/services/warehouse.service");
const create_warehouse_dto_1 = require("../../application/dtos/create-warehouse.dto");
const update_warehouse_dto_1 = require("../../application/dtos/update-warehouse.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let WarehouseController = class WarehouseController {
    constructor(service) {
        this.service = service;
    }
    findAll(businessStructureId, companyId) {
        return this.service.findAll(businessStructureId ? parseInt(businessStructureId, 10) : undefined, companyId ? parseInt(companyId, 10) : undefined);
    }
    getNextNumber(businessStructureId, companyId) {
        return this.service.getNextNumber(businessStructureId ? parseInt(businessStructureId, 10) : undefined, companyId ? parseInt(companyId, 10) : undefined);
    }
    findById(id, businessStructureId, companyId) {
        return this.service.findById(+id, businessStructureId ? parseInt(businessStructureId, 10) : undefined, companyId ? parseInt(companyId, 10) : undefined);
    }
    create(createDto, req, businessStructureId, companyId) {
        return this.service.create(createDto, businessStructureId ? parseInt(businessStructureId, 10) : undefined, companyId ? parseInt(companyId, 10) : undefined, req.user?.userId);
    }
    update(id, updateDto, req, businessStructureId, companyId) {
        return this.service.update(+id, updateDto, businessStructureId ? parseInt(businessStructureId, 10) : undefined, companyId ? parseInt(companyId, 10) : undefined, req.user?.userId);
    }
    remove(id, businessStructureId, companyId) {
        return this.service.remove(+id, businessStructureId ? parseInt(businessStructureId, 10) : undefined, companyId ? parseInt(companyId, 10) : undefined);
    }
};
exports.WarehouseController = WarehouseController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('Warehouse:Read'),
    __param(0, (0, common_1.Headers)('x-business-structure-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('next-number'),
    (0, permissions_decorator_1.Permissions)('Warehouse:Read'),
    __param(0, (0, common_1.Headers)('x-business-structure-id')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "getNextNumber", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('Warehouse:Read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-business-structure-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('Warehouse:Create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Headers)('x-business-structure-id')),
    __param(3, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_warehouse_dto_1.CreateWarehouseDto, Object, String, String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('Warehouse:Update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Headers)('x-business-structure-id')),
    __param(4, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_warehouse_dto_1.UpdateWarehouseDto, Object, String, String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('Warehouse:Delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-business-structure-id')),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WarehouseController.prototype, "remove", null);
exports.WarehouseController = WarehouseController = __decorate([
    (0, common_1.Controller)('inv/warehouses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [warehouse_service_1.WarehouseService])
], WarehouseController);
//# sourceMappingURL=warehouse.controller.js.map
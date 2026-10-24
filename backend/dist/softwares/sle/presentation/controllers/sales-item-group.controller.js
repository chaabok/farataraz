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
exports.SalesItemGroupController = void 0;
const common_1 = require("@nestjs/common");
const sales_item_group_service_1 = require("../../application/services/sales-item-group.service");
const sales_item_group_dto_1 = require("../../application/dtos/sales-item-group.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let SalesItemGroupController = class SalesItemGroupController {
    constructor(service) {
        this.service = service;
    }
    async getTree(search) {
        const tree = await this.service.getTree(search);
        return { data: tree, success: true };
    }
    async saveTree(body) {
        const result = await this.service.saveTree(body.treeData);
        return { data: result, success: true };
    }
    async create(createDto) {
        return this.service.create(createDto);
    }
    findAll(query) {
        return this.service.findAll(query);
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
exports.SalesItemGroupController = SalesItemGroupController;
__decorate([
    (0, common_1.Get)('tree'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SalesItemGroupController.prototype, "getTree", null);
__decorate([
    (0, common_1.Post)('tree/save'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sales_item_group_dto_1.SaveTreeDto]),
    __metadata("design:returntype", Promise)
], SalesItemGroupController.prototype, "saveTree", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sales_item_group_dto_1.CreateSalesItemGroupDto]),
    __metadata("design:returntype", Promise)
], SalesItemGroupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SalesItemGroupController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesItemGroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sales_item_group_dto_1.UpdateSalesItemGroupDto]),
    __metadata("design:returntype", void 0)
], SalesItemGroupController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesItemGroupController.prototype, "remove", null);
exports.SalesItemGroupController = SalesItemGroupController = __decorate([
    (0, common_1.Controller)('sle/sales-item-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [sales_item_group_service_1.SalesItemGroupService])
], SalesItemGroupController);
//# sourceMappingURL=sales-item-group.controller.js.map
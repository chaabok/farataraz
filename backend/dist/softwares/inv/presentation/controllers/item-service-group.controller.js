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
exports.ItemServiceGroupController = void 0;
const common_1 = require("@nestjs/common");
const item_service_group_service_1 = require("../../application/services/item-service-group.service");
const item_service_group_dto_1 = require("../../application/dtos/item-service-group.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let ItemServiceGroupController = class ItemServiceGroupController {
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
    async create(dto) {
        const data = await this.service.create(dto);
        return { data, success: true, message: 'گروه کالا خدمت با موفقیت ایجاد شد' };
    }
    async update(id, dto) {
        const data = await this.service.update(+id, dto);
        return { data, success: true, message: 'گروه کالا خدمت با موفقیت به‌روزرسانی شد' };
    }
    async findAll(query) {
        return this.service.findAll(query);
    }
    async findOne(id) {
        return this.service.findOne(+id);
    }
    async remove(id) {
        await this.service.remove(+id);
        return { success: true };
    }
};
exports.ItemServiceGroupController = ItemServiceGroupController;
__decorate([
    (0, common_1.Get)('tree'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ItemServiceGroupController.prototype, "getTree", null);
__decorate([
    (0, common_1.Post)('tree/save'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [item_service_group_dto_1.SaveTreeDto]),
    __metadata("design:returntype", Promise)
], ItemServiceGroupController.prototype, "saveTree", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [item_service_group_dto_1.CreateItemServiceGroupDto]),
    __metadata("design:returntype", Promise)
], ItemServiceGroupController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, item_service_group_dto_1.UpdateItemServiceGroupDto]),
    __metadata("design:returntype", Promise)
], ItemServiceGroupController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ItemServiceGroupController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ItemServiceGroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ItemServiceGroupController.prototype, "remove", null);
exports.ItemServiceGroupController = ItemServiceGroupController = __decorate([
    (0, common_1.Controller)('inv/item-service-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [item_service_group_service_1.ItemServiceGroupService])
], ItemServiceGroupController);
//# sourceMappingURL=item-service-group.controller.js.map
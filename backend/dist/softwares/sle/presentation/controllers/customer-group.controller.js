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
exports.CustomerGroupController = void 0;
const common_1 = require("@nestjs/common");
const customer_group_service_1 = require("../../application/services/customer-group.service");
const customer_group_dto_1 = require("../../application/dtos/customer-group.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
let CustomerGroupController = class CustomerGroupController {
    constructor(service) {
        this.service = service;
    }
    async findAll(leavesOnly) {
        const data = await this.service.findAll(leavesOnly === 'true' || leavesOnly === '1');
        return { data, success: true };
    }
    async checkDuplicate(field, value, excludeId, parentRef) {
        const isDuplicate = await this.service.checkDuplicate(field, value, excludeId ? Number(excludeId) : undefined, parentRef ? Number(parentRef) : undefined);
        return { data: { isDuplicate }, success: true };
    }
    async getNextCode(parentRef) {
        const nextCode = await this.service.getNextCode(parentRef ? Number(parentRef) : undefined);
        return { data: nextCode, success: true };
    }
    async getTree() {
        const data = await this.service.getTree();
        return { data, success: true };
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { data, success: true, message: 'گروه مشتریان با موفقیت ایجاد شد' };
    }
    async upsert(dto) {
        const data = await this.service.upsert(dto);
        return { data, success: true, message: 'عملیات ذخیره (Upsert) گروه مشتریان با موفقیت انجام شد' };
    }
    async update(id, dto) {
        const data = await this.service.update(+id, dto);
        return { data, success: true, message: 'گروه مشتریان با موفقیت به‌روزرسانی شد' };
    }
    async findOne(id) {
        const data = await this.service.findById(+id);
        return { data, success: true };
    }
    async remove(id) {
        await this.service.remove(+id);
        return { success: true };
    }
};
exports.CustomerGroupController = CustomerGroupController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('leavesOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerGroupController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('check-duplicate'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __param(3, (0, common_1.Query)('parentRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], CustomerGroupController.prototype, "checkDuplicate", null);
__decorate([
    (0, common_1.Get)('next-code'),
    __param(0, (0, common_1.Query)('parentRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerGroupController.prototype, "getNextCode", null);
__decorate([
    (0, common_1.Get)('tree'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomerGroupController.prototype, "getTree", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_group_dto_1.CreateCustomerGroupDto]),
    __metadata("design:returntype", Promise)
], CustomerGroupController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upsert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [customer_group_dto_1.CreateCustomerGroupDto]),
    __metadata("design:returntype", Promise)
], CustomerGroupController.prototype, "upsert", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, customer_group_dto_1.UpdateCustomerGroupDto]),
    __metadata("design:returntype", Promise)
], CustomerGroupController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerGroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CustomerGroupController.prototype, "remove", null);
exports.CustomerGroupController = CustomerGroupController = __decorate([
    (0, common_1.Controller)('sle/customer-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [customer_group_service_1.CustomerGroupService])
], CustomerGroupController);
//# sourceMappingURL=customer-group.controller.js.map
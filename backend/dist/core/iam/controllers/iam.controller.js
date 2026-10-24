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
exports.IamController = void 0;
const common_1 = require("@nestjs/common");
const iam_service_1 = require("../services/iam.service");
const jwt_auth_guard_1 = require("../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../auth/permissions.decorator");
let IamController = class IamController {
    constructor(iamService) {
        this.iamService = iamService;
    }
    async syncPermissions(body) {
        await this.iamService.syncPermissions(body.resources);
        return { success: true };
    }
    async getPermissions() {
        return this.iamService.getAllPermissions();
    }
    async getRoles() {
        return this.iamService.getAllRoles();
    }
    async createRole(body, companyId) {
        if (companyId && parseInt(companyId, 10) > 1)
            body.companyRef = parseInt(companyId, 10);
        return this.iamService.createRole(body);
    }
    async updateRolePermissions(id, body) {
        return this.iamService.updateRolePermissions(id, body.permissionIds, body.conditions);
    }
    async getUsers(pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters) {
        if (pageIndex !== undefined) {
            return this.iamService.getUsers({
                pageIndex: parseInt(pageIndex, 10),
                pageSize: parseInt(pageSize || '50', 10),
                sorting,
                columnFilters,
                globalFilter,
                advancedFilters,
            });
        }
        return this.iamService.getUsers();
    }
    async checkTwoFactorInUse() {
        return this.iamService.isTwoFactorInUse();
    }
    async getUser(id) {
        return this.iamService.getUserById(Number(id));
    }
    async createUser(body, companyId) {
        body.companyRef = (companyId && parseInt(companyId, 10) > 1) ? parseInt(companyId, 10) : 2;
        return this.iamService.createUser(body);
    }
    async updateUser(id, body, companyId) {
        body.companyRef = (companyId && parseInt(companyId, 10) > 1) ? parseInt(companyId, 10) : 2;
        return this.iamService.updateUser(Number(id), body);
    }
    async deleteUser(id) {
        const result = await this.iamService.deleteUser(Number(id));
        if (result.affected === 0) {
            throw new Error('کاربر یافت نشد یا قبلاً حذف شده است');
        }
        return { success: true };
    }
    async getUserGroups(pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters) {
        if (pageIndex !== undefined) {
            return this.iamService.getUserGroups({
                pageIndex: parseInt(pageIndex, 10),
                pageSize: parseInt(pageSize || '50', 10),
                sorting,
                columnFilters,
                globalFilter,
                advancedFilters,
            });
        }
        return this.iamService.getUserGroups();
    }
    async getUserGroup(id) {
        return this.iamService.getUserGroupById(Number(id));
    }
    async createUserGroup(body, companyId) {
        if (companyId && parseInt(companyId, 10) > 1)
            body.companyRef = parseInt(companyId, 10);
        return this.iamService.createUserGroup(body);
    }
    async updateUserGroup(id, body, companyId) {
        if (companyId && parseInt(companyId, 10) > 1)
            body.companyRef = parseInt(companyId, 10);
        return this.iamService.updateUserGroup(Number(id), body);
    }
    async deleteUserGroup(id) {
        const result = await this.iamService.deleteUserGroup(Number(id));
        if (result.affected === 0) {
            throw new Error('گروه کاربری یافت نشد');
        }
        return { success: true };
    }
    async getMyBusinessStructures(req) {
        return this.iamService.getMyBusinessStructures(req.user.userId);
    }
    async getBusinessStructureUsers(id) {
        return this.iamService.getBusinessStructureUsers(Number(id));
    }
    async addBusinessStructureUser(id, body) {
        return this.iamService.addBusinessStructureUser({
            businessStructureRef: Number(id),
            userRef: body.userRef
        });
    }
    async deleteBusinessStructureUser(id) {
        return this.iamService.deleteBusinessStructureUser(Number(id));
    }
};
exports.IamController = IamController;
__decorate([
    (0, common_1.Post)('permissions/sync'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Admin'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "syncPermissions", null);
__decorate([
    (0, common_1.Get)('permissions'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IamController.prototype, "getPermissions", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IamController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Post)('roles'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)('roles/:id/permissions'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "updateRolePermissions", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Read'),
    __param(0, (0, common_1.Query)('pageIndex')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('sorting')),
    __param(3, (0, common_1.Query)('columnFilters')),
    __param(4, (0, common_1.Query)('globalFilter')),
    __param(5, (0, common_1.Query)('advancedFilters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('2fa-in-use'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IamController.prototype, "checkTwoFactorInUse", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "getUser", null);
__decorate([
    (0, common_1.Post)('users'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)('users/:id'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "deleteUser", null);
__decorate([
    (0, common_1.Get)('user-groups'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Read'),
    __param(0, (0, common_1.Query)('pageIndex')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('sorting')),
    __param(3, (0, common_1.Query)('columnFilters')),
    __param(4, (0, common_1.Query)('globalFilter')),
    __param(5, (0, common_1.Query)('advancedFilters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "getUserGroups", null);
__decorate([
    (0, common_1.Get)('user-groups/:id'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "getUserGroup", null);
__decorate([
    (0, common_1.Post)('user-groups'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "createUserGroup", null);
__decorate([
    (0, common_1.Put)('user-groups/:id'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "updateUserGroup", null);
__decorate([
    (0, common_1.Delete)('user-groups/:id'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "deleteUserGroup", null);
__decorate([
    (0, common_1.Get)('me/business-structures'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "getMyBusinessStructures", null);
__decorate([
    (0, common_1.Get)('business-structure/:id/users'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "getBusinessStructureUsers", null);
__decorate([
    (0, common_1.Post)('business-structure/:id/users'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Create'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "addBusinessStructureUser", null);
__decorate([
    (0, common_1.Delete)('business-structure-users/:id'),
    (0, permissions_decorator_1.Permissions)('UserManagement:Delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IamController.prototype, "deleteBusinessStructureUser", null);
exports.IamController = IamController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('iam'),
    __metadata("design:paramtypes", [iam_service_1.IamService])
], IamController);
//# sourceMappingURL=iam.controller.js.map
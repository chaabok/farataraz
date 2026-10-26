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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolePermission = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../entities/app-base.entity");
const role_entity_1 = require("./role.entity");
const permission_entity_1 = require("./permission.entity");
let RolePermission = class RolePermission extends app_base_entity_1.AppBaseEntity {
};
exports.RolePermission = RolePermission;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'RolePermissionID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], RolePermission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, (role) => role.permissions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'RoleID' }),
    __metadata("design:type", role_entity_1.Role)
], RolePermission.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RoleID', type: 'bigint' }),
    __metadata("design:type", Number)
], RolePermission.prototype, "roleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_entity_1.Permission, (permission) => permission.rolePermissions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PermissionID' }),
    __metadata("design:type", permission_entity_1.Permission)
], RolePermission.prototype, "permission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PermissionID', type: 'bigint' }),
    __metadata("design:type", Number)
], RolePermission.prototype, "permissionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], RolePermission.prototype, "conditions", void 0);
exports.RolePermission = RolePermission = __decorate([
    (0, typeorm_1.Entity)({ name: 'RolePermission', schema: 'Iam' })
], RolePermission);
//# sourceMappingURL=role-permission.entity.js.map
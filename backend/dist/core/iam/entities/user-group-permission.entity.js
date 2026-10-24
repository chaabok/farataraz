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
exports.UserGroupPermission = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../entities/app-base.entity");
const user_group_entity_1 = require("./user-group.entity");
let UserGroupPermission = class UserGroupPermission extends app_base_entity_1.AppBaseEntity {
};
exports.UserGroupPermission = UserGroupPermission;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'UserGroupPermissionsID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], UserGroupPermission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_group_entity_1.UserGroup, (ug) => ug.permissions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'UserGroupRef' }),
    __metadata("design:type", user_group_entity_1.UserGroup)
], UserGroupPermission.prototype, "userGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UserGroupRef', type: 'bigint' }),
    __metadata("design:type", Number)
], UserGroupPermission.prototype, "userGroupRef", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserGroupPermission.prototype, "permissionKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserGroupPermission.prototype, "value", void 0);
exports.UserGroupPermission = UserGroupPermission = __decorate([
    (0, typeorm_1.Entity)({ name: 'UserGroupPermissions', schema: 'Iam' })
], UserGroupPermission);
//# sourceMappingURL=user-group-permission.entity.js.map
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
exports.UserGroup = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../entities/app-base.entity");
const user_group_permission_entity_1 = require("./user-group-permission.entity");
const user_entity_1 = require("./user.entity");
let UserGroup = class UserGroup extends app_base_entity_1.AppBaseEntity {
};
exports.UserGroup = UserGroup;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'UserGroupID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], UserGroup.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserGroup.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserGroup.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', nullable: true }),
    __metadata("design:type", String)
], UserGroup.prototype, "titleEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserGroup.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_group_permission_entity_1.UserGroupPermission, (ugp) => ugp.userGroup, { cascade: true }),
    __metadata("design:type", Array)
], UserGroup.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (u) => u.userGroup),
    __metadata("design:type", Array)
], UserGroup.prototype, "users", void 0);
exports.UserGroup = UserGroup = __decorate([
    (0, typeorm_1.Entity)({ name: 'UserGroups', schema: 'Iam' })
], UserGroup);
//# sourceMappingURL=user-group.entity.js.map
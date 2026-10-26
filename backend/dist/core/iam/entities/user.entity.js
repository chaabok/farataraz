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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../entities/app-base.entity");
const business_structure_entity_1 = require("../../../softwares/common/domain/entities/business-structure.entity");
const user_role_entity_1 = require("./user-role.entity");
const user_group_entity_1 = require("./user-group.entity");
let User = class User extends app_base_entity_1.AppBaseEntity {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'UserID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "repeatChangePassword", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_structure_entity_1.BusinessStructure, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'BusinessStructureID' }),
    __metadata("design:type", business_structure_entity_1.BusinessStructure)
], User.prototype, "businessStructure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BusinessStructureID', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "businessStructureId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_role_entity_1.UserRole, (ur) => ur.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "roles", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_group_entity_1.UserGroup, (ug) => ug.users, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'UserGroupRef' }),
    __metadata("design:type", user_group_entity_1.UserGroup)
], User.prototype, "userGroup", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UserGroupRef', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "userGroupRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastSeen", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "twoFactorSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isTwoFactorEnabled", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)({ name: 'User', schema: 'Iam' })
], User);
//# sourceMappingURL=user.entity.js.map
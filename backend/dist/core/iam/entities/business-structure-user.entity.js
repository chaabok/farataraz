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
exports.BusinessStructureUsers = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../entities/app-base.entity");
const user_entity_1 = require("./user.entity");
let BusinessStructureUsers = class BusinessStructureUsers extends app_base_entity_1.AppBaseEntity {
};
exports.BusinessStructureUsers = BusinessStructureUsers;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], BusinessStructureUsers.prototype, "businessStructureUsersId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'UserRef',
        type: 'bigint',
        nullable: false,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], BusinessStructureUsers.prototype, "userRef", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'BusinessStructureRef',
        type: 'bigint',
        nullable: false,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], BusinessStructureUsers.prototype, "businessStructureRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'UserRef' }),
    __metadata("design:type", user_entity_1.User)
], BusinessStructureUsers.prototype, "user", void 0);
exports.BusinessStructureUsers = BusinessStructureUsers = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Iam', name: 'BusinessStructureUsers' })
], BusinessStructureUsers);
//# sourceMappingURL=business-structure-user.entity.js.map